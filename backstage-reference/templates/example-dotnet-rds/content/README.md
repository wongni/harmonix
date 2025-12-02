# instructions
To use this .NET with RDS App follow the below steps

1. Bind your app to an RDS Database - use the binding feature under Management-> Bind Resource-> Add
2. Once binding completed - you should see the rds database bound in your "bound resource"
3. Go to your app repo and copy the secret ARN from a commit with the message "Bind Resource"
4. Within your app - using the environment variables in your overview tab set the below three variables:
   1. DB_SECRET=YourDBSecretARN
   2. AWS_REGION=YourDBRegion - i.e: us-east-1
   3. ENVIRONMENT_NAME=YourEnvironmentName - i.e: dev
5. Start your app, you should be able to connect to the database and execute queries.
