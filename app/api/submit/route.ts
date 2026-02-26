/* TODOS!!!

- Add checking the file type, but not the file.type cause it sucks
- rebuild everything with functions, for each stuff cause it helps
- quit streaming a file when you find it bad now you get the all even if they suck fuck them


*/

// the validation sucks I will do
// a better one on other brunch this one is like
//  okay if you need it at home otherwise don't trust it

import fs from "fs/promises";
import path from "path";
import { v4 } from "uuid";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = (formData.getAll("files") as File[]) || {};
  const filesArray = [];

  if (files.length > 20) {
    return new Response(JSON.stringify("Too many files. Max 20"));
  }

  // The message returned to the user
  let message: string[] = [];
  console.log("the files at the begining: ", files);

  // predefining an array and path for uploaded files, and their names
  const uploadedFilesNames: object[] = [];
  const upoladDir = path.join(process.cwd(), "public/uploads");

  // creating directory uploads if it doesn't exist
  try {
    await fs.mkdir(upoladDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directory: ", error);
    return new Response(JSON.stringify("Error creating directory"), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // file validation starts here

  // regex
  const FILE_PATH_REGEX = /([^A-z0-9_\- ])/;
  const FILE_TYPES = ["image/*"];
  console.log("files: ", files);
  await Promise.all(
    files.map(async (file) => {
      try {
        // check if file isn't empty
        if (file.size <= 0) {
          throw new Error("No files or File is empty");
          return;
        }

        // checking if the file's size isn't too big 10MB
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("This file is like your mom, it's too big!");
        }

        // checkinf files type
        if (!file.type.startsWith("image/")) {
          throw new Error("This isn't recognized as an image");
        }

        // dealing with file's name
        const fileClientName = path.basename(file.name || "unnamed").trim();
        const fileNoDotsName = fileClientName.replaceAll(".", "");

        if (FILE_PATH_REGEX.test(fileNoDotsName)) {
          throw new Error(
            "Invalid file name. File shoudn't contain special characters",
          );
        }

        // checking files name length
        if (fileNoDotsName.length > 200) {
          throw new Error(
            "Invalid file name. File name should be less than 200 characters",
          );
        }

        // the extension dealing with and creation of the server name of the file
        const extension = path.extname(fileClientName).toLowerCase();
        const fileServerName =
          `${v4()}-${fileNoDotsName}${extension}` as string;

        // checking of the length isn't too much in servername
        if (fileServerName.length > 250) {
          throw new Error("Isn't your extension too long or something mate? ");
        }

        // saving the file to the disk
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(upoladDir, fileServerName);
        await fs.writeFile(filePath, buffer);

        // giving the message to the user
        uploadedFilesNames.push({
          fileName: `${fileServerName}`,
          message: "",
        });
        message.push(`uploaded successfully as ${fileServerName}`);
      } catch (error) {
        console.error("Error saving file: ", error);

        message.push(`Error saving file: ${file.name}: ${error}\n`);
      }
    }),
  );

  return new Response(JSON.stringify(message), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function validateFile(file: File): string | null {
  return null;
}
