using Microsoft.AspNetCore.Mvc;
using System.ComponentModel;
using System.Text;

namespace Controllers;

[Route("encryption/sha")]
[ApiController]
public class Sha1Controller : ControllerBase
{
    private Sha1CipherService sha1;

    public Sha1Controller()
    {
        sha1 = new Sha1CipherService();
    }

    [HttpPost()]
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
            string hash = sha1.ComputeHash(bytes);
            return Ok(hash);
        }
        catch (IOException e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500);
        }
    }
}
