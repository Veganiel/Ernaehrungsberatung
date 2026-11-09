# Veganiel optional member accounts

Prepared 2026-11-09. Shop/Spreadshop and health calculator inputs are not included.

- `profiles`: existing public blog display names only.
- `member_details`: optional private contact details; own-user RLS on all operations.
- `quiz_results`: own-user reads; writes only through authenticated security-definer RPC.
- `quiz_result_events`: private idempotency keys; retained on progress reset so old retries cannot restore cleared data.
- Guest quiz progress remains local. Import requires an explicit click, and repeated imports of the same best score are deduplicated. Each account has a separate browser cache and pending queue. Requests capture the correct session token; responses from a previous account cannot replace the current account's display.
- Consultation link prepares a mailto draft that the user reviews and sends. It does not book or charge. Existing payment checkout remains independent.
- Full account deletion/export is requested by email. Private optional fields can be cleared in the account form; quiz results can be reset in Quizwelt.

## Database/configuration state

`20261109-member-accounts.sql` applied to the existing Supabase project. A transactional two-user test with rollback verified cross-user read/write protection, idempotent result submission and isolation of reset. An explicit anon EXECUTE revoke was also applied and verified (Supabase default function privileges otherwise granted it; unauthenticated calls were additionally rejected by the function).

Auth Site URL: https://veganiel.com/konto.html
Redirect allow-list: the above and https://veganiel.com/konto.html?recovery=1

## Release gate

Custom SMTP is saved in the dashboard (smtp.resend.com, 465, username resend, sender info@veganiel.com). The owner entered the secret API key. The sending domain veganiel.com is verified in Resend. Do not describe signup or recovery as live until a real confirmation email and password-recovery flow have been verified. Email confirmation remains required. Never disable it to work around SMTP.

Run `node --test tests/*.test.cjs` from the repository root. 37 tests passed during implementation, including guest/account separation, retry persistence and idempotent imports. Desktop/mobile account layout, DE/EN switch, blog account link and guest quiz render checked locally. Full authenticated browser flow awaits an owner-created test account and actual email delivery verification.
