namespace Ciphers;

public class Sha1CipherService
{
    private const int Rounds = 80;
    private uint[] digest = new uint[5];

    public Sha1CipherService()
    {}

    public string ComputeHash(byte[] message)
    {
        Reset();
        byte[] preprocessedMessage = PreprocessMessage(message);
        // for each of the 512-bit chunks
        for (int i = 0; i < preprocessedMessage.Length / 64; i++)
        {
            uint[] words = GetWords(preprocessedMessage, i);
            uint[] hash = GetHash(words);
            for (int j = 0; j < 5; j++)
            {
                digest[j] += hash[j];
            }
        }

        uint finalHash = digest[0] << 128 | digest[1] << 96 | digest[2] << 64 | digest[3] << 32 | digest[4];

        return finalHash.ToString("X");
    }

    private void Reset()
    {
        digest[0] = 0x67452301;
        digest[1] = 0xEFCDAB89;
        digest[2] = 0x98BADCFE;
        digest[3] = 0x10325476;
        digest[4] = 0xC3D2E1F0;
    }

    private byte[] PreprocessMessage(byte[] message)
    {
        int originalLength = message.Length;
        int lengthInBits = originalLength * 8;
        byte[] originalLengthBytes = BitConverter.GetBytes(lengthInBits);
        byte[] originalLength64 = new byte[8];
        for (int i = 0; i < 4; i++)
        {
            originalLength64[i + 4] = originalLengthBytes[i];
        }

        int paddingLength = 448 - (lengthInBits % 512);
        int newLength = originalLength + paddingLength / 8;

        byte[] extendedMessage = new byte[newLength];
        Array.Copy(message, extendedMessage, originalLength);
        extendedMessage[originalLength] = 0x80;

        byte[] finalMessage = new byte[newLength + 8];
        Array.Copy(extendedMessage, finalMessage, newLength);
        Array.Copy(originalLength64, 0, finalMessage, newLength, 8);
   
        return finalMessage;
    }

    private uint[] GetWords(byte[] message, int chunkNumber)
    {
        uint[] words = new uint[80];
        for (int i = 0; i < 16; i++)
        {
            words[i] = BitConverter.ToUInt32(message, chunkNumber * 64 + i * 4);
        }

        for (int i = 16; i < 80; i++)
        {
            words[i] = ROL(words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16], 1);
        }

        return words;
    }

    private uint[] GetHash(uint[] words)
    {
        uint a = digest[0], b = digest[1], c = digest[2], d = digest[3], e = digest[4];

        for (int i = 0; i < Rounds; i++)
        {
            uint f, k;
            if (i < 20)
            {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            }
            else if (i < 40)
            {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (i < 60)
            {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            }
            else
            {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }

            uint temp = ROL(a, 5) + f + e + k + words[i];
            e = d;
            d = c;
            c = ROL(b, 30);
            b = a;
            a = temp;
        }

        return new uint[] { a, b, c, d, e };
    }

    // calculation operations
    private static uint ROL(uint state, int num)
    {
        return (uint)((state << num) | (state >>> (32 - num)));
    }
}
