using Newtonsoft.Json;

namespace Ciphers;
public class FoursquareCipherService
{
    private List<char> plainMatrix1;
    private List<char> plainMatrix2;
    private List<char> cipherMatrix1;
    private List<char> cipherMatrix2;
    private readonly int n = 5;

    public FoursquareCipherService()
    {
        plainMatrix1 = new List<char>();
        plainMatrix2 = new List<char>();
        cipherMatrix1 = new List<char>();
        cipherMatrix2 = new List<char>();
        PopulateMatrices();
    }

    private void PopulateMatrices()
    {
        string fileName = "matrices.json";
        string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "config", fileName);
        var config = ReadConfig(fullPath);

        // This algorithm treats 'j' as 'i'
        // It could be solved with a dictionary which keeps track of which j's were replaced with i's
        // and then save that info in the message, but I don't think it is necessary for now
        const string alphabet = "abcdefghiklmnopqrstuvwxyz";
        int index = 0;

        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < n; j++)
            {
                index = i * n + j;
                plainMatrix1.Add(alphabet[index]);
                plainMatrix2.Add(alphabet[index]);
            }
        }

        cipherMatrix1 = config["cipherAlphabet1"].ToCharArray().ToList();
        cipherMatrix2 = config["cipherAlphabet2"].ToCharArray().ToList();
    }

    private Dictionary<string, string> ReadConfig(string filePath)
    {
        try
        {
            var json = File.ReadAllText(filePath);
            return JsonConvert.DeserializeObject<Dictionary<string, string>>(json)!;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading configuration file: {ex.Message}");
            return null!;
        }
    }

    private Tuple<int, int> GetLetterPosition(char letter, int? plainMatrixNumber, int? cipherMatrixNumber)
    {
        List<char> matrix;
        if (plainMatrixNumber != null)
            matrix = plainMatrixNumber == 1 ? plainMatrix1 : plainMatrix2;
        else if (cipherMatrixNumber != null)
            matrix = cipherMatrixNumber == 1 ? cipherMatrix1 : cipherMatrix2;
        else
            throw new ArgumentException("Invalid matrix number");

        var index = matrix.IndexOf(letter);
        if (index == -1)
            return Tuple.Create(-1, -1);

        var i = index / n;
        var j = index % n;
        return Tuple.Create(i, j);
    }

    public string EncryptMessage(string message)
    {
        if (message.Length % 2 == 1)
            message += 'x';

        var bigrams = Enumerable.Range(0, message.Length / 2)
                                .Select(i => message.Substring(i * 2, 2))
                                .ToList();

        var cipheredMessage = "";
        var bigFirstLetter = false;
        var bigSecondLetter = false;
        char firstLetter, secondLetter, cipheredLetter;
        Tuple<int, int> firstLetterPosition, secondLetterPosition;

        foreach (var bigram in bigrams)
        {
            bigFirstLetter = false;
            bigSecondLetter = false;
            firstLetter = bigram[0];
            secondLetter = bigram[1];

            if (char.IsUpper(firstLetter))
            {
                firstLetter = char.ToLower(firstLetter);
                bigFirstLetter = true;
            }

            if (char.IsUpper(secondLetter))
            {
                secondLetter = char.ToLower(secondLetter);
                bigSecondLetter = true;
            }

            if (firstLetter == 'j')
                firstLetter = 'i';

            if (secondLetter == 'j')
                secondLetter = 'i';

            firstLetterPosition = GetLetterPosition(firstLetter, 1, null);
            secondLetterPosition = GetLetterPosition(secondLetter, 2, null);

            if (firstLetterPosition.Item1 == -1 || secondLetterPosition.Item1 == -1)
            {
                cipheredMessage += bigram;
                continue;
            }

            cipheredLetter = cipherMatrix1[firstLetterPosition.Item1 * n + secondLetterPosition.Item2];
            cipheredMessage += bigFirstLetter ? char.ToUpper(cipheredLetter) : cipheredLetter;

            cipheredLetter = cipherMatrix2[secondLetterPosition.Item1 * n + firstLetterPosition.Item2];
            cipheredMessage += bigSecondLetter ? char.ToUpper(cipheredLetter) : cipheredLetter;
        }

        return cipheredMessage;
    }

    public string DecryptMessage(string message)
    {
        if (message.Length % 2 == 1)
            message += 'x';

        var bigrams = Enumerable.Range(0, message.Length / 2)
                                .Select(i => message.Substring(i * 2, 2))
                                .ToList();

        var decipheredMessage = "";
        var bigFirstLetter = false;
        var bigSecondLetter = false;
        char firstLetter, secondLetter, decipheredLetter;
        Tuple<int, int> firstLetterPosition, secondLetterPosition;

        foreach (var bigram in bigrams)
        {
            bigFirstLetter = false;
            bigSecondLetter = false;
            firstLetter = bigram[0];
            secondLetter = bigram[1];

            if (char.IsUpper(firstLetter))
            {
                firstLetter = char.ToLower(firstLetter);
                bigFirstLetter = true;
            }

            if (char.IsUpper(secondLetter))
            {
                secondLetter = char.ToLower(secondLetter);
                bigSecondLetter = true;
            }

            if (firstLetter == 'j')
                firstLetter = 'i';

            if (secondLetter == 'j')
                secondLetter = 'i';

            firstLetterPosition = GetLetterPosition(firstLetter, null, 1);
            secondLetterPosition = GetLetterPosition(secondLetter, null, 2);

            if (firstLetterPosition.Item1 == -1 || secondLetterPosition.Item1 == -1)
            {
                decipheredMessage += bigram;
                continue;
            }

            decipheredLetter = plainMatrix1[firstLetterPosition.Item1 * n + secondLetterPosition.Item2];
            decipheredMessage += bigFirstLetter ? char.ToUpper(decipheredLetter) : decipheredLetter;

            decipheredLetter = plainMatrix2[secondLetterPosition.Item1 * n + firstLetterPosition.Item2];
            decipheredMessage += bigSecondLetter ? char.ToUpper(decipheredLetter) : decipheredLetter;
        }

        return decipheredMessage;
    }
}
