using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using RefreshBookstore.Services;
using RefreshBookstore;
using System;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

var configuration = builder.Configuration;
var apiBaseUrl = configuration["ApiBaseUrl"] ?? "여기에 기본 URL을 넣으세요";

builder.Services.AddScoped(sp => new HttpClient {
    BaseAddress = new Uri(apiBaseUrl)
});

builder.Services.AddScoped<AuthenticationService>();

await builder.Build().RunAsync();
