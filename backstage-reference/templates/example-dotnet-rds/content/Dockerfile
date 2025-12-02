FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/${{ values.component_id }}.csproj", "./"]
RUN dotnet restore "./${{ values.component_id }}.csproj"
COPY src/ .
RUN dotnet build "${{ values.component_id }}.csproj" -c Release -o /app/build
RUN dotnet publish "${{ values.component_id }}.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE ${{ values.appPort }}
ENTRYPOINT ["dotnet", "${{ values.component_id }}.dll"]
