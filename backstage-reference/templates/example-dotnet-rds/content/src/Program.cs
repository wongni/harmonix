using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using Npgsql;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var appName = "${{ values.component_id }}";
var environmentName = Environment.GetEnvironmentVariable("ENVIRONMENT_NAME") ?? "Unknown Environment Name";
var dbSecret = Environment.GetEnvironmentVariable("DB_SECRET");
var awsRegion = Environment.GetEnvironmentVariable("AWS_REGION") ?? "us-east-1";

app.MapGet("/", async () =>
{
    var response = $"<h1>{appName}</h1><h2>Environment: {environmentName}</h2><h3>Success</h3><br />Note: the database connection has not yet been configured. (timestamp: {DateTime.Now})";

    if (!string.IsNullOrEmpty(dbSecret))
    {
        var secretValues = await GetSecretValue(dbSecret, awsRegion);
        var connString = $"Host={secretValues.host};Port={secretValues.port};Database={secretValues.dbname};Username={secretValues.username};Password={secretValues.password}";
        
        await using var conn = new NpgsqlConnection(connString);
        await conn.OpenAsync();
        await using var cmd = new NpgsqlCommand("SELECT now()", conn);
        var result = await cmd.ExecuteScalarAsync();
        
        response = $"<h1>{appName}</h1><h2>Environment: {environmentName}</h2><h3>Database Connection Successful!</h3><br />According to the database, the current date/time is {result}";
    }

    return Results.Content(response, "text/html");
});

app.MapGet("/health", () => new
{
    uptime = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds,
    status = "OK"
});

app.MapGet("/error", () => throw new Exception("Intentional error to demo seeing stack traces in logs"));

app.Run($"http://0.0.0.0:${{ values.appPort }}");

async Task<DbSecret> GetSecretValue(string secretName, string region)
{
    var client = new AmazonSecretsManagerClient(Amazon.RegionEndpoint.GetBySystemName(region));
    var response = await client.GetSecretValueAsync(new GetSecretValueRequest { SecretId = secretName });
    return JsonSerializer.Deserialize<DbSecret>(response.SecretString)!;
}

record DbSecret(string username, string password, string host, int port, string dbname);
