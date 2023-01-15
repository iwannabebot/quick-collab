using QuickCollab.Server.Models;
using System.Security.Cryptography;
using System.Text;

namespace QuickCollab.Server
{
    public static class StringExtensions
    {
        public static string GetHashedValue(this string value)
        {
            using HashAlgorithm algorithm = SHA256.Create();
            var hashBytes = algorithm.ComputeHash(Encoding.UTF8.GetBytes(value));
            StringBuilder sb = new StringBuilder();
            foreach (byte b in hashBytes)
                sb.Append(b.ToString("X2"));
            return sb.ToString();
        }
    }
}
