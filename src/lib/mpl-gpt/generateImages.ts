export async function generateImages(prompt: string, count: number): Promise<string[]> {
  const images: any[] = []
    const batchSize = 100;
    const batches = Math.ceil(count / batchSize);
    
    for(let i = 0; i < batches; i++) {
      const batchCount = Math.min(batchSize, count - (i * batchSize));
      const response = await fetch("https://mplgpt.ai/api/generateImages", {
        method: "POST",
        headers: {
          "accept": "*/*", 
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/json",
          "sec-ch-ua": '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "macOS",
        },
        body: JSON.stringify({
          prompt,
          count: batchCount
        })
  });

  const data = await response.json();
  console.log(data)
  images.push(...data.map((image: any) => image.url));
  console.log(`Processed batch ${i + 1} of ${batches}`);
}


  return images;
} 