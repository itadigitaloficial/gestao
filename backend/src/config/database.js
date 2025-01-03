const mongoose = require('mongoose');

class Database {
  constructor() {
    this.mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/gestao-projetos';
  }

  async connect() {
    try {
      await mongoose.connect(this.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('📦 Conexão com o banco de dados estabelecida');
    } catch (error) {
      console.error('❌ Erro ao conectar ao banco de dados:', error);
      process.exit(1);
    }
  }
}

module.exports = new Database(); 