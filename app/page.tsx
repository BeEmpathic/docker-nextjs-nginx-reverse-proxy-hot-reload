"use client";
import { FormEvent, useState } from "react";

export default function Page() {
  console.log("Test");
  const [data, setData] = useState<string[]>([]);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/submit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 413) {
        console.log("File size too large");
      }
      console.log("Respone not okay");
    }
    if (response.ok) {
      setData(await response.json());
    }

    // Handle response if necessary

    console.log("Just the response:", response);
    console.log("Data: ", data);
    // ...
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="file" multiple name="files" />
      <button className="cursor-pointer border-solid" type="submit">
        Submit
      </button>
      {
        <div id="result">
          {data.length > 0 ? (
            data.map((message, index) => <p key={index}>{message}</p>)
          ) : (
            <p>No files added yet</p>
          )}
        </div>
      }
    </form>
  );
}
