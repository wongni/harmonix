var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "OK");

app.MapGet("/health", () => new
{
    uptime = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds,
    status = "OK"
});

app.Run($"http://0.0.0.0:${{ values.appPort }}");
