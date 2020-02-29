var TurtleCoinWalletd = require('turtlecoin-walletd-rpc-js').default

const http = require('http');

var walletd = new TurtleCoinWalletd(
  'http://localhost',
  8080,
  'passw0rd',
  true
)

var fs = require('fs');

// LOAD DATABASE OF OUTGOING WALLETS

let db = {'wallets':[]};

try {
	db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
} catch(err) {}

// LOAD DATABASE OF TIP FUND WALLETS (SERVER RECIEVE)

let bank = {'wallets':[]};

try {
        bank = JSON.parse(fs.readFileSync('bank.json', 'utf8'));
} catch(err) {}



let registerWallet = (user, address) => {

	for ( i in db.wallets ) {
		console.log(db.wallets[i]);

		if (db.wallets[i].user == user) {
			db.wallets.splice(i, 1);
		}

	}

	db.wallets.push({"user":user,"address":address});
	console.log(db.wallets);

	let json = JSON.stringify(db);
	fs.writeFile('db.json',json,'utf8');

}

let getUserWallet = (user) => {

	for ( i in db.wallets ) {
                console.log(db.wallets[i]);

                if (db.wallets[i].user == user) {
                        return db.wallets[i].address;
                }

        }

	return false;

}

let getUserBank = (user) => {

        for ( i in bank.wallets ) {
                console.log(bank.wallets[i]);

                if (bank.wallets[i].user == user) {
                        return bank.wallets[i].wallet;
                }

        }

        return false;


}

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === 'general');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the server, ${member}`);



  user_bank = getUserBank(member.id);

  if (!user_bank) {
    walletd
            .createAddress()
            .then(resp => {
              console.log(resp.status)
              console.log(resp.headers)
              console.log(resp.body)

              wallet_addr = resp.body.result.address;

              bank.wallets.push({"user":member.id, "wallet":wallet_addr});

              registerWallet(member.id, wallet_addr);


                            member.send('Congratulations! You just got a kryptokrona wallet 😎');
                            member.send('Your address is: ' + wallet_addr);
                            member.send('You can use this address to deposit XKR, and if you want to withdraw simply use the !send command.')
                            member.send('Type !help for more information and more commands!');
                            member.send('If you want to help us out, you can use your wallet address to start mining. Read more here: https://kryptokrona.se/mining-pool/');


              let json = JSON.stringify(bank);
              fs.writeFile('bank.json',json,'utf8');


              	walletd
                        .sendTransaction(0,[{"address":wallet_addr,"amount":100000}],10,['SEKReTyRMJx2LTUrbf2r7GdMJ9PY5yHbYN6MCZkKUVvKZSwwwf3HnUS6Jia3TkD4jWgfxeh1AEYV3DKEAesSb7mSAvNqfCNBXrg'])
                        .then(resp => {
                          console.log(resp.status)
                          console.log(resp.headers)
                          console.log(resp.body)

                          member.send('Oh, and we also deposited 1000 XKR to your wallet as a thanks for joining us! Don\'t spend it all in one place 🤪');


                        })
                        .catch(err => {
                          console.log(err)

                        })


            })
            .catch(err => {
              console.log(err)
            })
    }

});

//Bot prompt for new bounty added

client.on('message', msg => { 
  if (msg.content.startsWith === 'Bounty: ') { 

    msg.reply('New bounty added! Check it out guys!!'); 

  } });


client.on('message', msg => {

  if ( msg.content.startsWith('!register') ) {

  let command = msg.content.split(' ');
	let address = command[1];

	if ( command[2] ) {
		msg.reply('Too many arguments!');
		return;
	}

        if ( address.length != 99 || !address.startsWith('SEKR') ) {
		msg.reply('Sorry, address is invalid.')
		return;
	}

    registerWallet(msg.author.id, address);

    user_bank = getUserBank(msg.author.id);

    if (!user_bank) {
	walletd
          .createAddress()
          .then(resp => {
            console.log(resp.status)
            console.log(resp.headers)
            console.log(resp.body)

            wallet_addr = resp.body.result.address;
            bank.wallets.push({"user":msg.author.id, "wallet":wallet_addr});

	    msg.author.send('Your new address for depositing tip funds is: ' + wallet_addr);

            let json = JSON.stringify(bank);
            fs.writeFile('bank.json',json,'utf8');


          })
          .catch(err => {
            console.log(err)
          })
	}

    msg.reply('Wallet registered! Your tips will be payed out to this account.');

}

  if (msg.content.startsWith('!help')) {

      console.log('help required kekeke');

    	const embed = new Discord.RichEmbed()
          // Set the title of the field
          .setTitle('AVAILABLE COMMANDS')
          .setThumbnail("https://kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png")
          // Set the color of the embed
          .setColor(0xff9300)
          // Set the main content of the embed
          .setDescription('Simply type out these commands, either in a channel where kryptokronabot is present or in a private message to the bot')
          .addField("!help", 'Displays this message.', false )
          .addField("!status", 'Displays current status of the kryptokrona network.', false )
          .addField("!register <address>", 'Registers a kryptokrona address for receiving tips (tags shouldn\'t be used)', false )
          .addField("!tip <@user> <amount>", 'Sends <amount> XKR to <@user> (tags shouldn\'t be used)', false )
          .addField("!send <address> <amount>", 'Sends <amount> XKR to <address> (tags shouldn\'t be used)', false )
        // Send the embed to the same channel as the message
        //addendum
          .addField("!tipall <amount>", 'Sends <amount> XKR to all registered wallets (tags shouldn\'t be used)', false )
          .addField("!tiprandom <amount>", 'Sends <amount> XKR to random registered wallet (tags shouldn\'t be used)', false )





    	msg.reply(embed);


  }

  if (msg.content.startsWith('!tip')) {

	command = msg.content.split(' ');
	receiver = command[1];
	receiver_id = receiver.replace(/[^0-9]/g,'');

	amount = command[2];

  if ( command[3] ) {
          msg.reply('Too many arguments!');
  }

	receiver_wallet = getUserWallet(receiver_id);

	if (!receiver_wallet) {
		client.users.get(receiver_id).send("Hello! You've just been sent a tip, but you don't have a registered wallet. Please use the !register <address> to receive tips.");
	}

	sender_wallet = getUserBank(msg.author.id);


	if(!sender_wallet) {

		msg.author.send("Please use the !register command to obtain a wallet which you can transfer tipping funds to. The command takes one argument, an already existing SEKR address that will be your wallet for receiving tips.");
		return;
	}

	walletd
          .sendTransaction(0,[{"address":receiver_wallet,"amount":parseInt(amount)*100}],10,[sender_wallet])
          .then(resp => {
            console.log(resp.status)
            console.log(resp.headers)
            console.log(resp.body)

            sender_wallet = resp.body.result.address;

	    msg.react("💸");


          })
          .catch(err => {
            console.log(err)
		msg.author.send("Sorry you don't have enough KKR in your wallet. Use !balance for more information.");
          })


}

  if (msg.content.startsWith('!send')) {

    console.log('Send command activated');

    sender_wallet = getUserBank(msg.author.id);
    command = msg.content.split(' ');
  	receiver_address = command[1];
    amount = command[2];

    if ( command[3] ) {
      msg.reply('Too many arguments!');
      return;
    }

    if ( receiver_address.length != 99 || !receiver_address.startsWith('SEKR') ) {
      msg.reply('Sorry, address is invalid.')
      return;
    }

    walletd
            .sendTransaction(0,[{"address":receiver_address,"amount":parseInt(amount)*100}],10,[sender_wallet])
            .then(resp => {
              console.log(resp.status)
              console.log(resp.headers)
              console.log(resp.body)

              sender_wallet = resp.body.result.address;

  	    msg.react("💸");


            })
            .catch(err => {
              console.log(err)
  		msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
            })


  }

  if (msg.content.startsWith('!status') ) {

	http.get('http://localhost:11898/getinfo', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
	console.log(data);
	json = JSON.parse(data);


	const embed = new Discord.RichEmbed()
      // Set the title of the field
      .setTitle('KRYPTOKRONA STATUS')
      .setThumbnail("https://kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png")
      // Set the color of the embed
      .setColor(0xff9300)
      // Set the main content of the embed
      .setDescription('Current block height and hashrate')
      .addField("Hashrate", json.hashrate + ' h/s', true )
      .addField("Blocks", json.height, true );
    // Send the embed to the same channel as the message





	msg.reply(embed);
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

  }
  if (msg.content.startsWith('!balance') ) {
	user_bank = getUserBank(msg.author.id);
	console.log(user_bank);
	if(!user_bank){
		msg.reply("You don't have a wallet yet! Use !register to get one.");
		return;
	}

	 walletd
          .getBalance(user_bank)
          .then(resp => {
            console.log(resp.status)
            console.log(resp.headers)
            console.log(resp.body)

            balance = resp.body.result.availableBalance / 100;

	    locked = resp.body.result.lockedAmount / 100;

	    msg.author.send("Your current balance is: " + balance + " KKR (" + locked + " pending). To top it up, send more to " + user_bank);

          })
          .catch(err => {
            console.log(err)
          })



}





});

client.login('t0k3n');

walletd
  .getStatus()
  .then(resp => {
    console.log(resp.status)
    console.log(resp.headers)
    console.log(resp.body)
  })
  .catch(err => {
    console.log(err)
  })