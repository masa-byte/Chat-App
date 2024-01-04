using System.Text;

namespace Ciphers;
public class LeaCipherService
{
    private static readonly uint[] Delta = { 0xc3efe9db, 0x44626b02, 0x79e27c8a, 0x78df30ec, 0x715ea49e, 0xc785da0a, 0xe04ef22a, 0xe5c40957 };
    private const int Rounds = 24; // because my key is 128 bits

    private int[] _key = new int[4]; // 4 integers -> 4 * 4 = 16 bytes * 8 = 128 bits
    private int[] _iv = new int[4]; // 4 integers -> 4 * 4 = 16 bytes * 8 = 128 bits
    private int[][] _roundKeys = new int[Rounds][];

    public LeaCipherService()
    {
        ReadKeyFromFile();
        ReadIVFromFile();
        GenerateRoundKeys();
    }

    private void ReadKeyFromFile()
    {
        string fileName = "key.bin";
        string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "config", fileName);

        try
        {
            byte[] fileBytes = File.ReadAllBytes(fullPath);
            PackIntoIntegers(_key, fileBytes);
        }
        catch (IOException e)
        {
            Console.WriteLine(e.Message);
        }
    }

    private void ReadIVFromFile()
    {
        string fileName = "iv.bin";
        string fullPath = Path.Combine(Directory.GetCurrentDirectory(), "config", fileName);

        try
        {
            byte[] fileBytes = File.ReadAllBytes(fullPath);
            PackIntoIntegers(_iv, fileBytes);
        }
        catch (IOException e)
        {
            Console.WriteLine(e.Message);
        }
    }

    private void GenerateRoundKeys()
    {
        int[] t = new int[4];

        _roundKeys = new int[Rounds][];

        for (int i = 0; i < 4; i++)
        {
            t[i] = _key[i];
        }

        for (int i = 0; i < 24; ++i)
        {
            int temp = ROL((int)Delta[i & 3], i);

            _roundKeys[i] = new int[6];

            _roundKeys[i][0] = t[0] = ROL(MODADD(t[0], ROL(temp, 0)), 1);
            _roundKeys[i][1] = _roundKeys[i][3] = _roundKeys[i][5] = t[1] = ROL(MODADD(t[1], ROL(temp, 1)), 3);
            _roundKeys[i][2] = t[2] = ROL(MODADD(t[2], ROL(temp, 2)), 6);
            _roundKeys[i][4] = t[3] = ROL(MODADD(t[3], ROL(temp, 3)), 11);
        }
    }

    public byte[] EncryptMessage(byte[] bytes)
    {
        // message must be n * 128 bits -> n * 16 bytes
        if (bytes.Length % 16 != 0)
        {
            bytes = PadBytes(bytes);
        }

        int[] messageIntegers = new int[bytes.Length / 4];
        byte[] encryptedBytes = new byte[bytes.Length];
        int[] block = new int[4];
        int[] prevBlock = new int[4];
        PackIntoIntegers(messageIntegers, bytes);

        // 128 bits in one round -> 16 bytes -> 4 integers
        for (int j = 0; j < messageIntegers.Length; j += 4)
        {
            if (j == 0)
            {
                for (int i = 0; i < 4; i++)
                {
                    block[i] = messageIntegers[i] ^ _iv[i];
                }
            }
            else
            {
                for (int i = 0; i < 4; i++)
                {
                    block[i] = messageIntegers[i + j] ^ prevBlock[i];
                }
            }

            for (int i = 0; i < Rounds; ++i)
            {
                block[3] = ROR(MODADD(block[2] ^ _roundKeys[i][4], block[3] ^ _roundKeys[i][5]), 3);
                block[2] = ROR(MODADD(block[1] ^ _roundKeys[i][2], block[2] ^ _roundKeys[i][3]), 5);
                block[1] = ROL(MODADD(block[0] ^ _roundKeys[i][0], block[1] ^ _roundKeys[i][1]), 9);
                ++i;

                block[0] = ROR(MODADD(block[3] ^ _roundKeys[i][4], block[0] ^ _roundKeys[i][5]), 3);
                block[3] = ROR(MODADD(block[2] ^ _roundKeys[i][2], block[3] ^ _roundKeys[i][3]), 5);
                block[2] = ROL(MODADD(block[1] ^ _roundKeys[i][0], block[2] ^ _roundKeys[i][1]), 9);

                ++i;
                block[1] = ROR(MODADD(block[0] ^ _roundKeys[i][4], block[1] ^ _roundKeys[i][5]), 3);
                block[0] = ROR(MODADD(block[3] ^ _roundKeys[i][2], block[0] ^ _roundKeys[i][3]), 5);
                block[3] = ROL(MODADD(block[2] ^ _roundKeys[i][0], block[3] ^ _roundKeys[i][1]), 9);

                ++i;
                block[2] = ROR(MODADD(block[1] ^ _roundKeys[i][4], block[2] ^ _roundKeys[i][5]), 3);
                block[1] = ROR(MODADD(block[0] ^ _roundKeys[i][2], block[1] ^ _roundKeys[i][3]), 5);
                block[0] = ROL(MODADD(block[3] ^ _roundKeys[i][0], block[0] ^ _roundKeys[i][1]), 9);
            }

            for (int i = 0; i < 4; i++)
            {
                prevBlock[i] = block[i] ^ messageIntegers[i + j];
            }

            byte[] encrypted = UnpackFromIntegers(block);
            for (int i = 0; i < encrypted.Length; i++)
            {
                encryptedBytes[i + j * 4] = encrypted[i];
            }
        }
        return encryptedBytes;
    }

    public byte[] EncryptMessage(string message)
    {
        byte[] bytes = Encoding.UTF8.GetBytes(message);
        return EncryptMessage(bytes);
    }

    public byte[] DecryptMessage(string encryptedMessage)
    {
        byte[] encryptedMessageBytes = HexStringToByteArray(encryptedMessage);
        int[] encryptedMessageIntegers = new int[encryptedMessageBytes.Length / 4];
        PackIntoIntegers(encryptedMessageIntegers, encryptedMessageBytes);

        byte[] decryptedBytes = new byte[encryptedMessageBytes.Length];
        int[] block = new int[4];
        int[] prevBlock = new int[4];

        // 128 bits in one round -> 16 bytes -> 4 integers
        for (int j = 0; j < encryptedMessageIntegers.Length; j += 4)
        {
            for (int i = 0; i < 4; i++)
            {
                block[i] = encryptedMessageIntegers[i + j];
            }

            for (int i = Rounds - 1; i >= 0; --i)
            {
                block[0] = MODSUB(ROR(block[0], 9), block[3] ^ _roundKeys[i][0]) ^ _roundKeys[i][1];
                block[1] = MODSUB(ROL(block[1], 5), block[0] ^ _roundKeys[i][2]) ^ _roundKeys[i][3];
                block[2] = MODSUB(ROL(block[2], 3), block[1] ^ _roundKeys[i][4]) ^ _roundKeys[i][5];
                --i;

                block[3] = MODSUB(ROR(block[3], 9), block[2] ^ _roundKeys[i][0]) ^ _roundKeys[i][1];
                block[0] = MODSUB(ROL(block[0], 5), block[3] ^ _roundKeys[i][2]) ^ _roundKeys[i][3];
                block[1] = MODSUB(ROL(block[1], 3), block[0] ^ _roundKeys[i][4]) ^ _roundKeys[i][5];
                --i;

                block[2] = MODSUB(ROR(block[2], 9), block[1] ^ _roundKeys[i][0]) ^ _roundKeys[i][1];
                block[3] = MODSUB(ROL(block[3], 5), block[2] ^ _roundKeys[i][2]) ^ _roundKeys[i][3];
                block[0] = MODSUB(ROL(block[0], 3), block[3] ^ _roundKeys[i][4]) ^ _roundKeys[i][5];
                --i;

                block[1] = MODSUB(ROR(block[1], 9), block[0] ^ _roundKeys[i][0]) ^ _roundKeys[i][1];
                block[2] = MODSUB(ROL(block[2], 5), block[1] ^ _roundKeys[i][2]) ^ _roundKeys[i][3];
                block[3] = MODSUB(ROL(block[3], 3), block[2] ^ _roundKeys[i][4]) ^ _roundKeys[i][5];
            }

            if (j == 0)
            {
                for (int i = 0; i < 4; i++)
                {
                    block[i] = block[i] ^ _iv[i];
                }
            }
            else
            {
                for (int i = 0; i < 4; i++)
                {
                    block[i] = block[i] ^ prevBlock[i];
                }
            }

            for (int i = 0; i < 4; i++)
            {
                prevBlock[i] = block[i] ^ encryptedMessageIntegers[i + j];
            }

            byte[] decrypted = UnpackFromIntegers(block);
            for (int i = 0; i < decrypted.Length; i++)
            {
                decryptedBytes[i + j * 4] = decrypted[i];
            }
        }
        return decryptedBytes;
    }

    // calculation operations
    private static int ROL(int state, int num)
    {
        return (int)((state << num) | (state >>> (32 - num)));
    }

    private static int ROR(int state, int num)
    {
        return (int)((state >>> num) | (state << (32 - num)));
    }

    private static int MODADD(int a, int b)
    {
        int c = a + b;
        // the same as number % 2^32
        return (int)(c & 0xFFFFFFFF);
    }

    private static int MODSUB(int a, int b)
    {
        int c = a - b;
        // the same as number % 2^32
        return (int)(c & 0xFFFFFFFF);
    }

    // utilities
    private byte[] PadBytes(byte[] bytes)
    {
        int length = bytes.Length;
        int padding = 16 - (length % 16);
        byte[] paddedBytes = new byte[length + padding];

        for (int i = 0; i < length; i++)
        {
            paddedBytes[i] = bytes[i];
        }

        for (int i = length; i < length + padding; i++)
        {
            paddedBytes[i] = (byte)padding;
        }

        return paddedBytes;
    }

    private void PackIntoIntegers(int[] integers, byte[] bytes)
    {
        for (int i = 0; i < integers.Length; i++)
        {
            integers[i] = BitConverter.ToInt32(bytes, i * 4);
        }
    }

    private byte[] UnpackFromIntegers(int[] integers)
    {
        byte[] bytes = new byte[integers.Length * 4];
        for (int i = 0; i < integers.Length; i++)
        {
            byte[] temp = BitConverter.GetBytes(integers[i]);
            for (int j = 0; j < 4; j++)
            {
                bytes[i * 4 + j] = temp[j];
            }
        }
        return bytes;
    }

    private byte[] HexStringToByteArray(string hex)
    {
        int numberChars = hex.Length;
        byte[] bytes = new byte[numberChars / 2];
        for (int i = 0; i < numberChars; i += 2)
            bytes[i / 2] = Convert.ToByte(hex.Substring(i, 2), 16);
        return bytes;
    }
}


