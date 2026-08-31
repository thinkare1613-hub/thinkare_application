import { useState } from "react";

type ClinicAddress = {
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
};

type CreateClinicAccountPageProps = {
  clinicName: string;
  adminName: string;
  email: string;
  phone: string;
  password: string;
  message: string;

  onClinicNameChange: (value: string) => void;
  onAdminNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onPasswordChange: (value: string) => void;

  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onBackToLogin: () => void;
};

export function CreateClinicAccountPage({
  clinicName,
  adminName,
  email,
  phone,
  password,
  message,
  onClinicNameChange,
  onAdminNameChange,
  onEmailChange,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  onBackToLogin,
}: CreateClinicAccountPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  const [registrationNumber, setRegistrationNumber] = useState("");

  const [clinicType, setClinicType] = useState("");

  const [website, setWebsite] = useState("");

  const [addresses, setAddresses] = useState<ClinicAddress[]>([
    {
      addressLine1: "",
      addressLine2: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
    },
  ]);

  const inputClassName =
    "mt-2 w-full rounded-xl border border-[#c7d5ca] bg-[#f8fbfa] px-4 py-3.5 text-[#17362c] placeholder:text-[#78908a] outline-none transition duration-200 focus:border-[#19b3a2] focus:bg-white focus:ring-4 focus:ring-[#19b3a2]/10";

  const updateAddress = (
    index: number,
    field: keyof ClinicAddress,
    value: string,
  ) => {
    setAddresses((current) =>
      current.map((address, addressIndex) =>
        addressIndex === index
          ? {
              ...address,
              [field]: value,
            }
          : address,
      ),
    );
  };

  const addAddress = () => {
    setAddresses((current) => [
      ...current,
      {
        addressLine1: "",
        addressLine2: "",
        country: "",
        state: "",
        city: "",
        postalCode: "",
      },
    ]);
  };

  const removeAddress = (index: number) => {
    setAddresses((current) =>
      current.filter((_, addressIndex) => addressIndex !== index),
    );
  };

  return (
    <main className="min-h-screen bg-[#e8f1ee] px-4 py-8 text-[#17362c] sm:px-6 lg:px-10">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-[#d8e2d9] bg-white shadow-[0_24px_60px_rgba(18,58,49,0.10)]">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#edf2ef] px-6 py-5 sm:px-8 lg:px-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#19b3a2]">
                Thinkare
              </p>

              <p className="mt-1 text-xs text-[#78908a]">
                Healthcare management platform
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="rounded-xl border border-[#c7d5ca] px-4 py-2.5 text-sm font-semibold text-[#17362c] transition hover:border-[#19b3a2] hover:bg-[#f3faf8] focus:outline-none focus:ring-4 focus:ring-[#19b3a2]/10"
            >
              Back to login
            </button>
          </div>

          {/* Page heading */}
          <div className="px-6 pb-6 pt-8 sm:px-8 lg:px-10">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#19b3a2]">
              Clinic onboarding
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#17362c] sm:text-4xl">
              Create your clinic account
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#587068]">
              Register your clinic and create the primary administrator
              account to start using Thinkare.
            </p>
          </div>

          {/* Main content */}
          <div className="grid lg:grid-cols-[0.75fr_1.25fr]">

            {/* Information panel */}
            <aside className="bg-[#17362c] px-6 py-8 text-white sm:px-8 lg:px-10">
              <div>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#19b3a2] text-xl font-bold">
                  T
                </div>

                <h2 className="text-2xl font-bold">
                  Your clinic workspace
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#c8d9d3]">
                  Create a secure workspace for your healthcare team and
                  manage your clinic operations from one place.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Manage patients",
                  "Manage doctors and staff",
                  "Schedule appointments",
                  "Manage multiple clinic locations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#e3efeb]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#19b3a2] text-xs font-bold">
                      ✓
                    </span>

                    {item}
                  </div>
                ))}
              </div>
            </aside>

            {/* Registration form */}
            <div className="px-6 py-8 sm:px-8 lg:px-10">

              <form onSubmit={onSubmit} className="space-y-8">

                {/* Clinic information */}
                <section>
                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-[#17362c]">
                      Clinic information
                    </h2>

                    <p className="mt-1 text-sm text-[#78908a]">
                      Enter your official clinic information.
                    </p>
                  </div>

                  <div className="space-y-5">

                    {/* Clinic name + clinic type */}
                    <div className="grid gap-5 sm:grid-cols-2">

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Clinic / Organization name
                        <span className="ml-1 text-[#d94a4a]">*</span>

                        <input
                          value={clinicName}
                          onChange={(event) =>
                            onClinicNameChange(event.target.value)
                          }
                          required
                          autoComplete="organization"
                          placeholder="ABC Dental Clinic"
                          className={inputClassName}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Clinic type
                        <span className="ml-1 text-[#d94a4a]">*</span>

                        <select
                          value={clinicType}
                          onChange={(event) =>
                            setClinicType(event.target.value)
                          }
                          required
                          className={inputClassName}
                        >
                          <option value="">Select clinic type</option>
                          <option value="General Clinic">
                            General Clinic
                          </option>
                          <option value="Dental Clinic">
                            Dental Clinic
                          </option>
                          <option value="Hospital">
                            Hospital
                          </option>
                          <option value="Diagnostic Center">
                            Diagnostic Center
                          </option>
                          <option value="Specialty Clinic">
                            Specialty Clinic
                          </option>
                          <option value="Medical Center">
                            Medical Center
                          </option>
                          <option value="Other">Other</option>
                        </select>
                      </label>
                    </div>

                    {/* Registration number + website */}
                    <div className="grid gap-5 sm:grid-cols-2">

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Registration / License Number
                        <span className="ml-1 text-[#d94a4a]">*</span>

                        <input
                          value={registrationNumber}
                          onChange={(event) =>
                            setRegistrationNumber(event.target.value)
                          }
                          required
                          placeholder="Enter registration number"
                          className={inputClassName}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Website
                        <span className="ml-1 text-xs font-normal text-[#78908a]">
                          Optional
                        </span>

                        <input
                          value={website}
                          onChange={(event) =>
                            setWebsite(event.target.value)
                          }
                          type="url"
                          placeholder="https://example.com"
                          className={inputClassName}
                        />
                      </label>
                    </div>

                    {/* Email + phone */}
                    <div className="grid gap-5 sm:grid-cols-2">

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Clinic email
                        <span className="ml-1 text-[#d94a4a]">*</span>

                        <input
                          value={email}
                          onChange={(event) =>
                            onEmailChange(event.target.value)
                          }
                          required
                          type="email"
                          autoComplete="email"
                          placeholder="clinic@domain.com"
                          className={inputClassName}
                        />
                      </label>

                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Clinic phone
                        <span className="ml-1 text-[#d94a4a]">*</span>

                        <input
                          value={phone}
                          onChange={(event) =>
                            onPhoneChange(event.target.value)
                          }
                          required
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="+91 98765 43210"
                          className={inputClassName}
                        />
                      </label>
                    </div>
                  </div>
                </section>

                {/* Addresses */}
                <section className="border-t border-[#edf2ef] pt-7">

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#17362c]">
                        Clinic address
                      </h2>

                      <p className="mt-1 text-sm text-[#78908a]">
                        Add one or more locations for your clinic.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addAddress}
                      className="w-fit rounded-xl border border-[#19b3a2] px-4 py-2.5 text-sm font-semibold text-[#138f82] transition hover:bg-[#eaf8f5]"
                    >
                      + Add another address
                    </button>
                  </div>

                  <div className="space-y-6">

                    {addresses.map((address, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-[#d8e2d9] bg-[#fbfdfc] p-5"
                      >

                        <div className="mb-5 flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-[#17362c]">
                              {index === 0
                                ? "Primary clinic address"
                                : `Clinic address ${index + 1}`}
                            </h3>

                            {index === 0 && (
                              <p className="mt-1 text-xs text-[#78908a]">
                                This is the primary registered location.
                              </p>
                            )}
                          </div>

                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#c34d4d] hover:bg-[#fff2f2]"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Address line 1 */}
                        <label className="block text-sm font-semibold text-[#1f352f]">
                          Address Line 1
                          <span className="ml-1 text-[#d94a4a]">*</span>

                          <input
                            value={address.addressLine1}
                            onChange={(event) =>
                              updateAddress(
                                index,
                                "addressLine1",
                                event.target.value,
                              )
                            }
                            required
                            placeholder="Building / Street / Area"
                            className={inputClassName}
                          />
                        </label>

                        {/* Address line 2 */}
                        <label className="mt-5 block text-sm font-semibold text-[#1f352f]">
                          Address Line 2
                          <span className="ml-1 text-xs font-normal text-[#78908a]">
                            Optional
                          </span>

                          <input
                            value={address.addressLine2}
                            onChange={(event) =>
                              updateAddress(
                                index,
                                "addressLine2",
                                event.target.value,
                              )
                            }
                            placeholder="Landmark / Suite / Floor"
                            className={inputClassName}
                          />
                        </label>

                        {/* Country + State */}
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">

                          <label className="block text-sm font-semibold text-[#1f352f]">
                            Country
                            <span className="ml-1 text-[#d94a4a]">*</span>

                            <input
                              value={address.country}
                              onChange={(event) =>
                                updateAddress(
                                  index,
                                  "country",
                                  event.target.value,
                                )
                              }
                              required
                              placeholder="India"
                              className={inputClassName}
                            />
                          </label>

                          <label className="block text-sm font-semibold text-[#1f352f]">
                            State / Province
                            <span className="ml-1 text-[#d94a4a]">*</span>

                            <input
                              value={address.state}
                              onChange={(event) =>
                                updateAddress(
                                  index,
                                  "state",
                                  event.target.value,
                                )
                              }
                              required
                              placeholder="Tamil Nadu"
                              className={inputClassName}
                            />
                          </label>
                        </div>

                        {/* City + Postal code */}
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">

                          <label className="block text-sm font-semibold text-[#1f352f]">
                            City
                            <span className="ml-1 text-[#d94a4a]">*</span>

                            <input
                              value={address.city}
                              onChange={(event) =>
                                updateAddress(
                                  index,
                                  "city",
                                  event.target.value,
                                )
                              }
                              required
                              placeholder="Chennai"
                              className={inputClassName}
                            />
                          </label>

                          <label className="block text-sm font-semibold text-[#1f352f]">
                            Postal Code
                            <span className="ml-1 text-[#d94a4a]">*</span>

                            <input
                              value={address.postalCode}
                              onChange={(event) =>
                                updateAddress(
                                  index,
                                  "postalCode",
                                  event.target.value,
                                )
                              }
                              required
                              placeholder="600100"
                              className={inputClassName}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Administrator */}
                <section className="border-t border-[#edf2ef] pt-7">

                  <div className="mb-5">
                    <h2 className="text-xl font-bold text-[#17362c]">
                      Primary administrator
                    </h2>

                    <p className="mt-1 text-sm text-[#78908a]">
                      This account will manage the clinic workspace.
                    </p>
                  </div>

                  <div className="space-y-5">

                    {/* Admin name */}
                    <label className="block text-sm font-semibold text-[#1f352f]">
                      Admin name
                      <span className="ml-1 text-[#d94a4a]">*</span>

                      <input
                        value={adminName}
                        onChange={(event) =>
                          onAdminNameChange(event.target.value)
                        }
                        required
                        autoComplete="name"
                        placeholder="Dr. John Smith"
                        className={inputClassName}
                      />
                    </label>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-[#1f352f]">
                        Password
                        <span className="ml-1 text-[#d94a4a]">*</span>
                      </label>

                      <div className="relative">
                        <input
                          value={password}
                          onChange={(event) =>
                            onPasswordChange(event.target.value)
                          }
                          required
                          minLength={8}
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Create a secure password"
                          className={`${inputClassName} pr-20`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-[#587068] hover:bg-[#eaf7f4] hover:text-[#17362c]"
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-[#78908a]">
                        Minimum 8 characters.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="border-t border-[#edf2ef] pt-6">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#19b3a2] px-4 py-3.5 text-base font-bold text-white shadow-[0_12px_25px_rgba(25,179,162,0.25)] transition hover:bg-[#14a191] hover:shadow-[0_16px_30px_rgba(25,179,162,0.30)] focus:outline-none focus:ring-4 focus:ring-[#19b3a2]/20 active:translate-y-px"
                  >
                    Create clinic account
                  </button>

                  <p className="mt-3 text-center text-xs text-[#78908a]">
                    Fields marked with{" "}
                    <span className="font-bold text-[#d94a4a]">*</span>{" "}
                    are required.
                  </p>
                </div>
              </form>

              {/* Message */}
              {message && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-[#9bc7af] bg-[#e4f1e8] px-4 py-3 text-sm font-medium text-[#0d523e]"
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}