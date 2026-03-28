import crypto from 'crypto';

async function cekSaldo() {
  // Ganti dengan data asli Anda jika perlu, atau script ini akan membaca argumen CLI
  const username = "mucopuWjPMBo";
  const apiKey = "8c4469f6-2c65-5e45-a8e7-d5270195a525";
  const endpoint = "https://api.digiflazz.com/v1/cek-saldo";
  
  // Rumus wajib dari Digiflazz: MD5(username + apikey + "depo")
  const signStr = `${username}${apiKey}depo`;
  const sign = crypto.createHash('md5').update(signStr).digest('hex');

  console.log('🔄 Mempersiapkan Data Cek Saldo Digiflazz...');
  console.log(`Username : ${username}`);
  console.log(`API Key  : ${apiKey}`);
  console.log(`String   : ${signStr}`);
  console.log(`MD5 Sign : ${sign}`);
  console.log('--------------------------------------------------');

  const payload = {
    cmd: "deposit",
    username: username,
    sign: sign
  };

  console.log('📤 Mengirim Request:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('--------------------------------------------------');
    console.log(`📥 Status HTTP : ${response.status} ${response.statusText}`);
    console.log('📥 Respon Digiflazz:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Gagal melakukan request:', error);
  }
}

cekSaldo();
