import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch
from uuid import UUID, uuid4

from fastapi import HTTPException

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import main


class FakeConnection:
    def __init__(self, *, consent=None, wearable=None, metrics=None):
        self.patient_id = uuid4()
        self.consent = consent
        self.wearable = wearable
        self.metrics = metrics or []
        self.statements = []
        self.result = None
        self.rows = []
        self.rowcount = 2
        self.commits = 0

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def execute(self, query, params=()):
        normalized_query = " ".join(query.split())
        self.statements.append((normalized_query, params))
        self.result = None
        self.rows = []

        if normalized_query.startswith("SELECT id FROM patients"):
            self.result = (self.patient_id,)
        elif normalized_query.startswith("SELECT consent_version"):
            self.result = self.consent
        elif normalized_query.startswith("SELECT connected_at"):
            self.result = self.wearable
        elif normalized_query.startswith("SELECT MAX(recorded_at)"):
            self.result = (None,)
        elif normalized_query.startswith("SELECT granted_at"):
            self.result = self.consent
        elif normalized_query.startswith("SELECT id, provider"):
            self.rows = self.metrics

        return self

    def fetchone(self):
        return self.result

    def fetchall(self):
        return self.rows

    def commit(self):
        self.commits += 1


class WearableApiTests(unittest.TestCase):
    def setUp(self):
        self.user = {
            "id": str(uuid4()),
            "clinic_id": str(uuid4()),
            "role": "PATIENT",
        }

    def test_non_uuid_demo_subject_returns_404_before_database_query(self):
        connection = FakeConnection()
        with self.assertRaises(HTTPException) as raised:
            main.get_authenticated_patient_id(
                {"id": "user-demo-patient", "clinic_id": self.user["clinic_id"]},
                connection,
            )

        self.assertEqual(raised.exception.status_code, 404)
        self.assertIn("verified patient profile is required", raised.exception.detail)
        self.assertEqual(connection.statements, [])

    def test_status_is_derived_from_authenticated_patient_and_provider_stays_disabled(self):
        connection = FakeConnection()
        with patch.object(main.psycopg, "connect", return_value=connection):
            result = main.wearable_fitbit_status(self.user)

        self.assertFalse(result["connected"])
        self.assertFalse(result["consent_granted"])
        self.assertFalse(result["provider_ready"])
        self.assertTrue(result["health_connect_available"])
        self.assertIsNone(result["connection_method"])
        self.assertEqual(connection.statements[0][1], (UUID(self.user["id"]), self.user["clinic_id"]))
        self.assertTrue(all("patient_id" not in query.lower() or params for query, params in connection.statements))

    def test_metrics_query_uses_authenticated_patient_and_returns_saved_rows(self):
        recorded_at = datetime.now(timezone.utc)
        connection = FakeConnection(metrics=[("metric-id", "fitbit", "steps", 9, "count", recorded_at)])
        with patch.object(main.psycopg, "connect", return_value=connection):
            result = main.list_wearable_health_metrics(self.user)

        self.assertEqual(result[0]["metric_type"], "steps")
        self.assertEqual(connection.statements[0][1], (UUID(self.user["id"]), self.user["clinic_id"]))
        self.assertEqual(connection.statements[1][1], (connection.patient_id,))

    def test_empty_consent_version_is_rejected_without_database_access(self):
        connection = FakeConnection()
        with patch.object(main.psycopg, "connect", return_value=connection):
            with self.assertRaises(HTTPException) as raised:
                main.update_wearable_consent(
                    main.WearableConsentRequest(granted=True, consent_version="  "),
                    self.user,
                )

        self.assertEqual(raised.exception.status_code, 422)
        self.assertEqual(connection.statements, [])

    def test_consent_grant_and_revoke_write_for_authenticated_patient(self):
        for granted in (True, False):
            connection = FakeConnection()
            with self.subTest(granted=granted), patch.object(
                main.psycopg, "connect", return_value=connection
            ):
                result = main.update_wearable_consent(
                    main.WearableConsentRequest(granted=granted, consent_version="qa-v1"),
                    self.user,
                )

            self.assertEqual(result, {"consent_granted": granted})
            self.assertEqual(connection.commits, 1)
            self.assertEqual(connection.statements[0][1], (UUID(self.user["id"]), self.user["clinic_id"]))
            if granted:
                self.assertIn("INSERT INTO wearable_consents", connection.statements[1][0])
            else:
                self.assertIn("refresh_token_ciphertext = NULL", connection.statements[2][0])

    def test_connect_and_sync_require_active_consent(self):
        for route in (main.connect_fitbit, main.sync_fitbit):
            connection = FakeConnection(consent=None)
            with self.subTest(route=route.__name__), patch.object(
                main.psycopg, "connect", return_value=connection
            ), self.assertRaises(HTTPException) as raised:
                if route is main.sync_fitbit:
                    route(main.WearableSyncRequest(source="health_connect", metrics=[]), self.user)
                else:
                    route(self.user)

            self.assertEqual(raised.exception.status_code, 403)

    def test_oauth_connect_returns_503_after_active_consent_when_google_provider_unavailable(self):
        active_consent = (datetime.now(timezone.utc), None)
        connection = FakeConnection(consent=active_consent)
        with patch.object(main.psycopg, "connect", return_value=connection), self.assertRaises(HTTPException) as raised:
            main.connect_fitbit(self.user)

        self.assertEqual(raised.exception.status_code, 503)

    def test_health_connect_sync_persists_patient_metrics_idempotently(self):
        active_consent = (datetime.now(timezone.utc), None)
        connection = FakeConnection(consent=active_consent)
        connection.rowcount = 1
        payload = main.WearableSyncRequest(
            source="health_connect",
            metrics=[
                main.WearableMetricInput(
                    metric_type="steps",
                    metric_value=1200,
                    unit="count",
                    recorded_at=datetime.now(timezone.utc),
                )
            ],
        )
        with patch.object(main.psycopg, "connect", return_value=connection):
            result = main.sync_fitbit(payload, self.user)

        self.assertEqual(result, {"synced_count": 1, "received_count": 1})
        self.assertIn("ON CONFLICT (patient_id, provider, metric_type, recorded_at) DO NOTHING", connection.statements[2][0])
        self.assertEqual(connection.statements[2][1][0], connection.patient_id)
        self.assertIn("connection_method = 'health_connect'", connection.statements[3][0])
        self.assertEqual(connection.commits, 1)

    def test_health_connect_sync_rejects_wrong_units_before_database_access(self):
        payload = main.WearableSyncRequest(
            source="health_connect",
            metrics=[
                main.WearableMetricInput(
                    metric_type="steps",
                    metric_value=100,
                    unit="bpm",
                    recorded_at=datetime.now(timezone.utc),
                )
            ],
        )
        connection = FakeConnection()
        with patch.object(main.psycopg, "connect", return_value=connection), self.assertRaises(HTTPException) as raised:
            main.sync_fitbit(payload, self.user)

        self.assertEqual(raised.exception.status_code, 422)
        self.assertEqual(connection.statements, [])

    def test_disconnect_revokes_consent_and_preserves_metrics(self):
        connection = FakeConnection()
        with patch.object(main.psycopg, "connect", return_value=connection):
            result = main.disconnect_fitbit(self.user)

        self.assertEqual(result, {"connected": False, "health_metrics_preserved": True})
        self.assertEqual(connection.commits, 1)
        self.assertIn("revoked_at = NOW()", connection.statements[1][0])
        self.assertIn("access_token_ciphertext = NULL", connection.statements[2][0])

    def test_delete_metrics_is_patient_scoped(self):
        connection = FakeConnection()
        with patch.object(main.psycopg, "connect", return_value=connection):
            result = main.delete_wearable_health_metrics(self.user)

        self.assertEqual(result, {"deleted_count": 2})
        query, params = connection.statements[1]
        self.assertIn("WHERE patient_id = %s", query)
        self.assertEqual(params, (connection.patient_id,))
        self.assertEqual(connection.commits, 1)

    def test_oauth_callback_reports_provider_unavailable(self):
        with self.assertRaises(HTTPException) as raised:
            main.fitbit_callback()

        self.assertEqual(raised.exception.status_code, 503)


if __name__ == "__main__":
    unittest.main()
