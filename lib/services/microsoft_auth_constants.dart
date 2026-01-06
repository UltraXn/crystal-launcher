class MicrosoftAuthConstants {
  // User's App ID
  static const String clientId = "a7c734b0-1aa7-4e0c-8579-2b36b4e36981";

  // Port 1338 as configured in Azure (No trailing slash as per user snippet)
  static const String redirectUri = "http://127.0.0.1:1338";

  // Standard Scopes
  static const String scope = "XboxLive.Signin offline_access";

  // Consumers Endpoint
  static String get authorizeUrl =>
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize"
      "?client_id=$clientId"
      "&response_type=code"
      "&redirect_uri=$redirectUri"
      "&scope=$scope";

  static String get tokenUrl =>
      "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
}
