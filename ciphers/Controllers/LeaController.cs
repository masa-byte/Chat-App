using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace Controllers;

[Route("encryption/lea")]
[ApiController]
public class LeaController : ControllerBase
{
    private LeaCipherService lea;

    public LeaController()
    {
        lea = new LeaCipherService();
    }

    [HttpPost("encrypt")]
    public IActionResult EncryptMessage([FromBody] Message input)
    {
        string message = input.message;
        byte[] encryptedMessage = lea.EncryptMessage(message);
        return Ok(ByteArrayToHexString(encryptedMessage));
    }

    [HttpPost("decrypt")]
    public IActionResult DecryptMessage([FromBody] Message input)
    {
        string encryptedMessage = input.message;
        byte[] decryptedMessage = lea.DecryptMessage(encryptedMessage);
        return Ok(Encoding.UTF8.GetString(decryptedMessage));
    }

    // Utility method to convert byte array to hex string
    private string ByteArrayToHexString(byte[] bytes)
    {
        StringBuilder hex = new StringBuilder(bytes.Length * 2);
        foreach (byte b in bytes)
            hex.AppendFormat("{0:X2}", b);
        return hex.ToString();
    }
}
