import fs from "fs";

let index = 0;
const generate = 13;

for (let i = 0; i < generate; i++) {
  const nftIndex = index + 1;

  const metadata = {
    name: `AIRT #${nftIndex}`,
    description: "AIRT generated for the Solana Blockchain",
    symbol: "AIRT",
    image: `https://shdw-drive.genesysgo.net/zkBm6ZGZuHq85dJESQkEGU4dDm8SXxmxmEbm4oiVTZs/art-${nftIndex}.png`,
    properties: {
      files: [
        {
          uri: `https://shdw-drive.genesysgo.net/zkBm6ZGZuHq85dJESQkEGU4dDm8SXxmxmEbm4oiVTZs/art-${nftIndex}.png`,
          type: "image/png",
        },
      ],
      category: "image",
    },
  };

  fs.writeFileSync(
    `./json/${nftIndex}.json`,
    JSON.stringify(metadata, null, 2)
  );
  index++;
}
