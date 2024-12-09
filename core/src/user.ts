import { z } from "zod";

export module User {
  export const passwordSchema = z
    .string()
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@#$%&])[A-Za-z\d@$%#&]{6,}$/);

  export const Info = z.object({
    userId: z.string(),
    name: z.string(),
    email: z.string(),
    type: z.enum(["admin", "operator"]),
  });

  export type Info = z.infer<typeof Info>;

  export const createId = () => `U-${Math.floor(Math.random() * 100000000)}`;

  /*The username of the new account should be formed using the first letter of the firstname
concatenated with the lastname. For example, if the firstname is ‘John’ and the lastname is
‘Murray’, then the username will be ‘jmurray’.*/
  export const createUsername = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName}`.toLowerCase();
  };

  export const generatePassword = (): string => {
    const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "$%#@&";

    let password = "";

    // Add at least one alphabet
    password += alphabet[Math.floor(Math.random() * alphabet.length)];

    // Add at least one number
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // Add at least one special character
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Add remaining characters to reach minimum length of 6
    while (password.length < 6) {
      const allChars = alphabet + numbers + specialChars;
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };
}
