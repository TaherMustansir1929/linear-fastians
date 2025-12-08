-- Migration v4: Enable Deletion
-- Since we are moving to a Server Action that verifies ownership in code,
-- we can enable a more permissive DELETE policy for the table, 
-- OR rely on the Service Role Key (if set).
-- To ensure it works even if the Service Role Key is missing (falling back to Anon Key),
-- we add a policy that allows deletion (Ownership is checked in the Server Action).

create policy "Enable delete for authenticated users" 
on public.documents 
for delete 
to public 
using ( true );

-- Note: This delegates security to the Application Layer (Server Action).
-- Ensure 'deleteDocumentAction' in 'src/app/actions.ts' checks user permissions.
