const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const { MongoClient } = require("mongodb");

async function getMongoURI() {
  const credential = new DefaultAzureCredential();
  const keyVaultName = "app-service-practice";
  const keyVaultUri = `https://${keyVaultName}.vault.azure.net`;

  const client = new SecretClient(keyVaultUri, credential);

  try {
    const secret = await client.getSecret("MONGO-URI");
    return secret.value;
  } catch (error) {
    console.error("Error retrieving MongoDB URI from Key Vault:", error);
    throw error;
  }
}

async function connectToMongoDB() {
  try {
    const uri = await getMongoURI();
    const client = new MongoClient(uri);
    await client.connect();

    console.log("Connected to MongoDB");
    const database = client.db("notes-db");
    const collection = database.collection("notes");

    return collection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = { connectToMongoDB };
