/*
 * Used to define the APi endpoints
 */

using Microsoft.AspNetCore.Mvc;

namespace TestProject.Controllers {
    // Attributes in C#. 
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase {

        private readonly ILogger<TestController> _logger;

        public TestController(ILogger<TestController> logger) {
            _logger = logger;
        }
        // specifies that a function runs when a user visits specific url
        [HttpGet]
        public string Get() {
            return "API Response";
        }
    }
}