namespace RefreshBookstore.Services
{
    public class AuthenticationService
    {
        private readonly HttpClient _httpClient;

        public AuthenticationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> CheckLoginStatusAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("/login/status");
                if (!response.IsSuccessStatusCode)
                {
                    return false;
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                return responseContent == "true";
            }
            catch
            {
                return false;
            }
        }
    }
}
