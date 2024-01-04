using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
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

    [HttpPost("fileEncrypt")]
    public IActionResult EncryptFile([FromBody] Message input)
    {
        string fileContent = input.message;
        string[] fileContentArray = fileContent.Split(',');
        int n = fileContentArray.Length;

        int[] ints = new int[n];
        byte[] bytes = new byte[n];

        for (int i = 0; i < n; i++)
        {
            ints[i] = int.Parse(fileContentArray[i]);
            bytes[i] = (byte)ints[i];
        }

        try
        {
            byte[] encryptedFile = lea.EncryptMessage(bytes);
            return Ok(ByteArrayToHexString(encryptedFile));
        }
        catch (IOException e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500);
        }
    }

    [HttpPost("decrypt")]
    public IActionResult DecryptMessage([FromBody] Message input)
    {
        string encryptedMessage = input.message;
        byte[] decryptedMessage = lea.DecryptMessage(encryptedMessage);
        return Ok(Encoding.UTF8.GetString(decryptedMessage));
    }

    [HttpPost("fileDecrypt")]
    public IActionResult DecryptFile([FromBody] Message input)
    {
        string encryptedFile = input.message;
        byte[] decryptedFile = lea.DecryptMessage(encryptedFile);
        int[] ints = new int[decryptedFile.Length];
        string[] strings = new string[decryptedFile.Length];
        for (int i = 0; i < decryptedFile.Length; i++)
        {
            ints[i] = (int)decryptedFile[i];
            strings[i] = ints[i].ToString();
        }
        string decryptedFileString = string.Join(",", strings);
        return Ok(decryptedFileString);
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
