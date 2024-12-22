import searchAssets from "./das/searchAssets";
import umiWithCurrentWalletAdapter from "./umi/umiWithCurrentWalletAdapter";

const fetchUserAssets = async (collectionId: string) => {
  const umi = umiWithCurrentWalletAdapter();

  return await searchAssets({
    owner: umi.identity.publicKey,
    collection: collectionId,
    burnt: false,
  }, collectionId);
};

export default fetchUserAssets;
