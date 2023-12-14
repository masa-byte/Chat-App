using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace Controllers;

[Route("encryption/fs")]
[ApiController]
public class FoursquareController : ControllerBase
{
    private FoursquareCipherService foursquare;

    public FoursquareController()
    {
        foursquare = new FoursquareCipherService();
    }

    [HttpPost("encrypt")]
    public IActionResult EncryptMessage([FromBody] Message input)
    {
        string message = input.message;
        String encryptedMessage = foursquare.EncryptMessage(message);
        return Ok(encryptedMessage);
    }

    [HttpPost("decrypt")]
    public IActionResult DecryptMessage([FromBody] Message input)
    {
        string encryptedMessage = input.message;
        String decryptedMessage = foursquare.DecryptMessage(encryptedMessage);
        return Ok(decryptedMessage);
    }
}
