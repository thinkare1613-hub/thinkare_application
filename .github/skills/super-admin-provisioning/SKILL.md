---
name: super-admin-provisioning
description: "Provision or verify a Thinkare PLATFORM_ADMIN account. Use when creating a super admin, bootstrapping platform access, resolving missing platform-admin access, or checking super-admin account setup."
argument-hint: "Create or verify a super-admin account"
---

# Super-Admin Provisioning

Create a single Thinkare platform administrator through the repository's supported backend script. Keep secrets out of chat, source control, logs, and command history where practical.

## When To Use

- Create the initial `PLATFORM_ADMIN` account for a configured database.
- Verify whether a named email can be provisioned as a super admin.
- Resolve platform access when no super-admin account exists.

## Preconditions

1. Confirm the target database has the `roles` and `users` tables and required migrations have been applied.
2. Confirm `backend` dependencies are installed in the selected Python environment.
3. Ask the user to set these environment variables directly in their terminal; never request or repeat passwords in chat:
   - `DATABASE_URL`
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD`
4. Optionally set `SUPER_ADMIN_NAME`. It defaults to `Thinkare Super Admin`.

## Procedure

1. Start in the repository root and use the active virtual environment, if one is configured.
2. Confirm that `DATABASE_URL`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` are defined without printing their values.
3. Run the provisioner from the repository root:

   ```powershell
   python backend/create_super_admin.py
   ```

4. Interpret the result:
   - `Created PLATFORM_ADMIN account for <email>`: provisioning completed.
   - `A user already exists with SUPER_ADMIN_EMAIL.`: do not retry with the same email; the account already exists and must be verified rather than recreated.
   - Missing environment-variable error: stop, set the indicated variable securely, then rerun.
   - Database connection or table error: stop and resolve the database URL, connectivity, or migrations before retrying.
5. Verify the account with a parameterized database query or the application's authorized admin-access flow. Confirm the user is active, verified, and assigned the `PLATFORM_ADMIN` role. Do not display password hashes.

## Completion Checks

- The command exits successfully and prints the created-account confirmation, or an existing account has been positively verified.
- The target user has `PLATFORM_ADMIN`, `is_active = TRUE`, and `is_verified = TRUE`.
- No secret values, including the database URL or password, were written to source-controlled files or shared in chat output.

## Guardrails

- The provisioner creates the `PLATFORM_ADMIN` role only when it is absent.
- The provisioner intentionally refuses to overwrite an existing email address.
- Do not modify the script to bypass the duplicate-email check. Use an approved account-management path for role changes or credential resets.