const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// File ka full path nikalta hai, e.g. getFilePath('users') -> data/users.json
const getFilePath = (name) => path.join(dataDir, `${name}.json`);

// Data read karo (file nahi hai toh khud bana dega with empty array)
const readData = async (name) => {
  const filePath = getFilePath(name);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(filePath, '[]');
      return [];
    }
    throw err;
  }
};

// Data write karo
const writeData = async (name, data) => {
  const filePath = getFilePath(name);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Unique id banata hai
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
};

module.exports = { readData, writeData, generateId };