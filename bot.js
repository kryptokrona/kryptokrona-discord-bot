var TurtleCoinWalletd = require('turtlecoin-walletd-rpc-js').default
const { MessageEmbed } = require('discord.js');

const http = require('http');

const fetch = require('node-fetch');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

let api = "https://spookyplanet.nl:3001/coin/XKR/LTC";

let settings = { method: "Get" };

const config = require('./config');

var walletd = new TurtleCoinWalletd(
  'http://localhost',
  8888,
  config.rpcPassword,
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
} catch(err) {console.log(err)}



let registerWallet = (user, address) => {

	for ( i in db.wallets ) {

		if (db.wallets[i].user == user) {
			db.wallets.splice(i, 1);
		}

	}

	db.wallets.push({"user":user,"address":address});

	let json = JSON.stringify(db);
	fs.writeFile('db.json',json, function(err, result) {
		if (err) console.log('error', err);
});

}

let getUserWallet = async (user) => {
	for ( i in db.wallets ) {

                if (db.wallets[i].user == user) {
                        return db.wallets[i].address;
                }

        }

}

let getUserBank = async (user) => {


        for ( i in bank.wallets ) {

                if (bank.wallets[i].user == user) {
                        return bank.wallets[i].wallet;
                }

        }


}

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Welcome to the Kryptokrona server, ${member}! To gain access you just need to react to the message in #roles `);


  user_bank = false;
  user_bank = await getUserBank(member.id);

  if (!user_bank) {
    walletd
            .createAddress()
            .then(resp => {

              wallet_addr = resp.body.result.address;

              bank.wallets.push({"user":member.id, "wallet":wallet_addr});

              registerWallet(member.id, wallet_addr);


                            member.send('Congratulations! You just got a kryptokrona wallet 😎');
                            member.send('Your address is: ' + wallet_addr);
                            member.send('You can use this address to deposit XKR, and if you want to withdraw simply use the !send command.')
                            member.send('Type !help for more information and more commands!');
                            member.send('If you want to help us out, you can use your wallet address to start mining. Read more here: https://kryptokrona.se/mining-pool/');


              let json = JSON.stringify(bank);
              fs.writeFile('bank.json',json, function(err, result) {
                if (err) console.log('error', err);
		});


              	walletd
                        .sendTransaction(7,[{"address":wallet_addr,"amount":100000}],1000,[config.donateAddress])
                        .then(resp => {

                          member.send('Oh, and we also deposited 1 XKR to your wallet as a thanks for joining us! Don\'t spend it all in one place 🤪');


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

client.on('message', async msg => {

  if ( msg.content.startsWith('!register') ) {

  let command = msg.content.split(' ');

	if ( command[2] ) {
		msg.reply('Too many arguments!');
		return;
	}

    user_bank = false;
    user_bank = await getUserBank(msg.author.id);

    if (!user_bank) {
      walletd
              .createAddress()
              .then(resp => {

                wallet_addr = resp.body.result.address;

                bank.wallets.push({"user":msg.author.id, "wallet":wallet_addr});

                registerWallet(msg.author.id, wallet_addr);


                              msg.author.send('Congratulations! You just got a kryptokrona wallet 😎');
                              msg.author.send('Your address is: ' + wallet_addr);
                              msg.author.send('You can use this address to deposit XKR, and if you want to withdraw simply use the !send command.')
                              msg.author.send('Type !help for more information and more commands!');
                              msg.author.send('If you want to help us out, you can use your wallet address to start mining. Read more here: https://kryptokrona.se/mining-pool/');


                let json = JSON.stringify(bank);
                fs.writeFile('bank.json',json, function(err, result) {
                	if (err) console.log('error', err);
		});


                	walletd
                          .sendTransaction(7,[{"address":wallet_addr,"amount":100000}],1000,[config.donateAddress])
                          .then(resp => {

                            member.send('Oh, and we also deposited 1 XKR to your wallet as a thanks for joining us! Don\'t spend it all in one place 🤪');


                          })
                          .catch(err => {
                            console.log(err)

                          })


              })
              .catch(err => {
                console.log(err)
              })
      }


}

  if (msg.content.startsWith('!help')) {

      const messageEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("AVAILABLE COMMANDS")
      .setDescription("Simply type out these commands, either in a channel where kryptokronabot is present or in a private message to the bot")
      .setThumbnail("https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png")
      .addFields(
        {
          "name": "!help",
          "value": "Displays this message."
        },
        {
          "name": "!status",
          "value": "Displays current status of the kryptokrona network."
        },
        {
          "name": "!tip <@user> <amount>",
          "value": 'Sends <amount> XKR to <@user> (tags shouldn\'t be used)'
        },
        {
          "name": "!send <address> <amount>",
          "value": 'Sends <amount> XKR to <address> (tags shouldn\'t be used)'
        }
      )
      .setTimestamp()
      .setFooter()
      msg.channel.send(messageEmbed)


  }

  if (msg.content.startsWith('!tip')) {

	command = msg.content.split(' ');
	receiver = command[1];
	receiver_id = receiver.replace(/[^0-9]/g,'');

	amount = command[2];

    if ( command[3] ) {
          msg.reply('Too many arguments!');
    }
  let receiver_wallet = false;
	receiver_wallet = await getUserBank(receiver_id);

	if (!receiver_wallet) {
    client.users.cache.get(receiver_id).send("Hello! You've just been sent a tip, but you don't have a registered wallet. Please use the !register <address> to receive tips.");
	}
  sender_wallet = false;
	sender_wallet = await getUserBank(msg.author.id);


	if(!sender_wallet) {

		msg.author.send("Please use the !register command to obtain a wallet which you can transfer tipping funds to. The command takes one argument, an already existing SEKR address that will be your wallet for receiving tips.");
		return;
	}
	walletd
          .sendTransaction(3,[{"address":receiver_wallet,"amount":parseInt(amount*100000)}],1000,[sender_wallet])
          .then(resp => {

            sender_wallet = resp.body.result.address;

	    msg.react("💸");


          })
          .catch(err => {
            console.log(err)
		msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
          })


    }

      if (msg.content.startsWith('!tipalles')) {

          let allBanks = bank.wallets;
          command = msg.content.split(' ');
          amount = command[1]/(allBanks.length-1);
          sender_wallet = false;
          sender_wallet = getUserBank(msg.author.id);
          walletd
              .getBalance(sender_wallet)
              .then(resp => {

                  balance = resp.body.result.availableBalance / 100000;

                  locked = resp.body.result.lockedAmount / 100000;

                  if (balance < amount*(allBanks.length-1)) {
                      msg.reply('Sorry you don\'t have enough XKR in your wallet. Use !balance for more information.')
                      return;
                  }

              })
              .catch(err => {
                  console.log(err)
              })

          if ( command[2] ) {
              msg.reply('Too many arguments!');
              return;
          }


          for (i in allBanks) {
              receiver_wallet = allBanks[i].wallet;
              if (receiver_wallet == sender_wallet) {
                  continue;
              }

              walletd
                  .sendTransaction(7, [{
                      "address": receiver_wallet,
                      "amount": parseInt(amount * 100000)
                  }], 1000, [sender_wallet])
                  .then(resp => {
			client.users.get(allBanks[i].user).send("You were just sent " + parseInt(amount) + " XKR!");

                      msg.react("💸");



                  })
                  .catch(err => {
                      console.log(err)
                      msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
                      return;
                  })

          }
          msg.reply(amount + ' XKR sent to ' + (allBanks.length-1) + ' people.');




      }

  if (msg.content.startsWith('!send')) {

    sender_wallet = false;
    sender_wallet = await getUserBank(msg.author.id);
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
            .sendTransaction(3,[{"address":receiver_address,"amount":parseInt(amount)*100000}],1000,[sender_wallet])
            .then(resp => {

              sender_wallet = resp.body.result.address;

  	    msg.react("💸");


            })
            .catch(err => {
              console.log(err)
  		msg.author.send("Sorry you don't have enough XKR in your wallet. Use !balance for more information.");
            })


  }

  if (msg.content.startsWith('!status') ) {

	http.get('http://pool.kryptokrona.se:11898/getinfo', (resp) => {
	  let data = '';

  let totalSupp = 0;
  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
	  json_node = JSON.parse(data);
        fetch('http://pool.kryptokrona.se:11898/json_rpc', {
            method: 'POST',
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: "test",
              method: "getblockheaderbyheight",
              params: {
                height: json_node.height - 1
              }
            }),
            headers: { 'Content-Type': 'application/json' }
        }).then(res => res.json())
          .then(


            json => {
                fetch('http://pool.kryptokrona.se:11898/json_rpc', {
                    method: 'POST',
                    body: JSON.stringify({
                      jsonrpc: "2.0",
                      id: "test",
                      method: "f_block_json",
                      params: {
                        hash: json.result.block_header.hash
                      }
                    }),
                    headers: { 'Content-Type': 'application/json' }
                }).then(res => res.json())
                  .then(
                    jsonn => {
                      fetch('https://api.coinpaprika.com/v1/tickers/xkr-kryptokrona', {
                          method: 'GET'
                      }).then(res => res.json())
                        .then(
                          jsongecko => {
                            let  xkrprice = {};
				xkrprice = jsongecko.quotes.USD.price;



                        let marketCap = parseFloat(xkrprice * parseInt(jsonn.result.block.alreadyGeneratedCoins) / 100000).toFixed(2);

                              // inside a command, event listener, etc.
                              const messageEmbed = new MessageEmbed()
                              .setColor("#0099ff")
                              .setTitle("KRYPTOKRONA STATUS")
                              .setDescription("This is live information about the kryptokrona network")
                              .setThumbnail("https://old.kryptokrona.se/wp-content/uploads/2019/04/logo-white-shadow.png")
                              .addFields(
                                {
                                  name: "Hashrate",
                                  value: json_node.hashrate + " h/s",
                                },
                                { name: "\u200B", value: "\u200B" },
                                {
                                  name: "📦 Blockheight:",
                                  value: json_node.height,
                                  inline: true,
                                },
                                {
                                  name: "📈 Current price:",
                                  value:"$" + xkrprice,
                                  inline: true,
                                },
                                {
                                  name: "Market cap:",
                                  value: "$" + marketCap,
                                }
                              )
                              .setTimestamp()
                              .setFooter()
     		 	      msg.channel.send(messageEmbed)
                              //msg.reply({ embeds: [messageEmbed] });

                            });

                          });


            }





        );



  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

  }
  if (msg.content.startsWith('!balance') ||  msg.content.startsWith('!bal')) {
    user_bank = false;
	user_bank = await getUserBank(msg.author.id);
	if(!user_bank){
		msg.reply("You don't have a wallet yet! Use !register to get one.");
		return;
	}

	 walletd
          .getBalance(user_bank)
          .then(resp => {

            balance = resp.body.result.availableBalance / 100000;

	    locked = resp.body.result.lockedAmount / 100000;

	    msg.author.send("Your current balance is: " + balance + " XKR (" + locked + " pending). To top it up, send more to " + user_bank);

          })
          .catch(err => {
            console.log(err)
          })



}





});

client.login(config.discordToken);

walletd
  .getStatus()
  .then(resp => {
  })
  .catch(err => {
    console.log(err)
  })
