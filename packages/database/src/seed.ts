// packages/database/src/seed.ts
//
// Creates the first SUPER_ADMIN user using ONLY the Supabase Admin SDK.
// No direct database connection needed — works via Supabase REST API.
//
// Required env vars in packages/database/.env:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SEED_USER_EMAIL
//   SEED_USER_PASSWORD

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Validate env
// ---------------------------------------------------------------------------
const required = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SEED_USER_EMAIL",
  "SEED_USER_PASSWORD",
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`\n❌  Missing env var: ${key}`);
    console.error(`    Add it to packages/database/.env\n`);
    process.exit(1);
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const EMAIL = process.env.SEED_USER_EMAIL!;
const PASSWORD = process.env.SEED_USER_PASSWORD!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
async function main() {
  console.log("\n🌱  Cain AIOS — Seeding first user\n");
  console.log(`   Email    : ${EMAIL}`);
  console.log(`   Role     : SUPER_ADMIN`);

  // ------------------------------------------------------------------
  // 1. Ensure the agency exists (every user row requires an agencyId)
  // ------------------------------------------------------------------
  let agencyId: string;

  const { data: existingAgencies, error: agencyFetchError } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("slug", "cain-family-insurance")
    .limit(1);

  if (agencyFetchError) {
    console.error("\n❌  Could not query agencies table:", agencyFetchError.message);
    console.error("    Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct.\n");
    process.exit(1);
  }

  if (existingAgencies && existingAgencies.length > 0) {
    agencyId = existingAgencies[0].id;
    console.log(`\n✓   Agency exists  : ${existingAgencies[0].name} (${agencyId})`);
  } else {
    const { data: newAgency, error: agencyCreateError } = await supabase
      .from("agencies")
      .insert({
        name: "Cain Family Insurance",
        slug: "cain-family-insurance",
        plan: "ENTERPRISE",
        is_active: true,
        is_white_label: false,
      })
      .select("id, name")
      .single();

    if (agencyCreateError || !newAgency) {
      console.error("\n❌  Failed to create agency:", agencyCreateError?.message);
      process.exit(1);
    }

    agencyId = newAgency.id;
    console.log(`\n✅  Agency created : ${newAgency.name} (${agencyId})`);
  }

  // ------------------------------------------------------------------
  // 2. Create (or confirm) Supabase Auth user
  // ------------------------------------------------------------------
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("\n❌  Could not list auth users:", listError.message);
    process.exit(1);
  }

  const existingAuthUser = listData?.users.find((u) => u.email === EMAIL);
  let authUserId: string;

  if (existingAuthUser) {
    authUserId = existingAuthUser.id;
    console.log(`\n✓   Supabase auth user already exists (${authUserId})`);
  } else {
    const { data, error: createAuthError } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true, // skip the confirmation email for seed
    });

    if (createAuthError || !data?.user) {
      console.error("\n❌  Failed to create Supabase auth user:", createAuthError?.message);
      process.exit(1);
    }

    authUserId = data.user.id;
    console.log(`\n✅  Supabase auth user created (${authUserId})`);
  }

  // ------------------------------------------------------------------
  // 3. Create (or confirm) user row in our users table
  // ------------------------------------------------------------------
  const { data: existingDbUser, error: dbFetchError } = await supabase
    .from("users")
    .select("id, email, role, status")
    .eq("email", EMAIL)
    .limit(1);

  if (dbFetchError) {
    console.error("\n❌  Could not query users table:", dbFetchError.message);
    process.exit(1);
  }

  if (existingDbUser && existingDbUser.length > 0) {
    const u = existingDbUser[0];
    console.log(`\n✓   DB user already exists`);
    console.log(`   ID     : ${u.id}`);
    console.log(`   Role   : ${u.role}`);
    console.log(`   Status : ${u.status}`);
  } else {
    const { data: newDbUser, error: dbCreateError } = await supabase
      .from("users")
      .insert({
        agency_id: agencyId,
        email: EMAIL,
        first_name: "Admin",
        last_name: "User",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      })
      .select("id, email, role, status")
      .single();

    if (dbCreateError || !newDbUser) {
      console.error("\n❌  Failed to create DB user:", dbCreateError?.message);
      process.exit(1);
    }

    console.log(`\n✅  DB user created`);
    console.log(`   ID     : ${newDbUser.id}`);
    console.log(`   Email  : ${newDbUser.email}`);
    console.log(`   Role   : ${newDbUser.role}`);
    console.log(`   Status : ${newDbUser.status}`);
  }

  console.log("\n🎉  Done! You can now log in at http://localhost:3000/login\n");
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err);
  process.exit(1);
});
