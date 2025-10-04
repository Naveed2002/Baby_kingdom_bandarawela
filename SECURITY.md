# Security Best Practices

## Environment Variables

Never commit sensitive environment variables to version control. Always use `.gitignore` to exclude `.env` files.

### For Developers

1. Copy `.env.example` to create your local `.env` file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Update the values in `.env` with your actual credentials

3. Never commit `.env` files to version control

## Credential Rotation

If credentials are accidentally exposed:

1. Immediately rotate all exposed passwords:
   - Email account passwords
   - Database passwords
   - API keys and secrets
   - OAuth credentials

2. Generate new JWT secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
   ```

3. Create new OAuth credentials in the respective services (Google Cloud Console, etc.)

## Git History Cleanup

If sensitive data was committed:

1. Use `git filter-repo` to remove files from history:
   ```bash
   pip3 install git-filter-repo
   git filter-repo --path backend/.env --invert-paths --force
   ```

2. Force push to remote repository:
   ```bash
   git push origin --force --all
   ```

## MongoDB Security

1. Use strong, unique passwords for database users
2. Enable IP whitelisting in MongoDB Atlas
3. Regularly rotate database credentials
4. Use separate database users for different applications

## Google OAuth Security

1. Never expose client secrets in client-side code
2. Use environment variables for server-side credentials
3. Regularly rotate OAuth credentials
4. Restrict OAuth redirect URIs to known domains