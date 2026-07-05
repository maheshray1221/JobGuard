export const detectInputType = (input: string): "url" | "paste" => {
  const trimmed = input.trim();

  try {
    const url = new URL(
      trimmed.startsWith("www.") ? `https://${trimmed}` : trimmed,
    );
    //  protocol bhi check karo — sirf http/https valid hai
    if (url.protocol === "http:" || url.protocol === "https:") {
      return "url";
    }
  } catch {
    // URL nahi hai — paste hai
  }

  return "paste";
};
