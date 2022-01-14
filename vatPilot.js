//Define Packages
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const mariadb = require('mariadb');
const pool = mariadb.createPool({
     host: 'localhost',
     user:'root',
     password: 'Austin1124',
     connectionLimit: 5
});

module.exports = {
    name: 'vatroles',
    description: 'This command checks the provided CID with the VATSIM API, then issues roles',
    execute(message, args) {
        
        //Define roles
        let pilotRole = message.guild.roles.cache.find( roles => roles.name === 'VATSIM Pilot');
        let atcRole = message.guild.roles.cache.find( roles => roles.name === 'VATSIM ATC');
        let insRole = message.guild.roles.cache.find( roles => roles.name === 'VATSIM Instructor');
        let supRole = message.guild.roles.cache.find( roles => roles.name === 'VATSIM Supervisor');

        //define others here
        
        let memberTarget = message.guild.members.cache.get(message.author.id);

        const vatCID = args[0];
        if (isNaN(vatCID)) {
            message.channel.send(`<@${memberTarget.user.id}> that is Not a Number, please try again`);
        }
        const vatURL = "https://api.vatsim.net/api/ratings/" + vatCID + "/rating_times/"
        console.log(vatURL);
        console.log('Waiting for response');
        async function database_add() {
            let conn;
            try {
                conn = await pool.getConnection();
                // const rows = await conn.query("SELECT 1 as val");
                const response = await conn.query("SELECT * FROM `vatsim id discord`.`approved`")
                console.log(response); //[ {val: 1}, meta: ... ]
                const res = await conn.query("INSERT INTO approved (Discord, Vatsim) VALUES (?, ?)", [message.author, vatCID]);
                console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
            } catch (err) {
                throw err;
            } finally {
                if (conn) return conn.end();
            }
        }
        vatJSON = axios.get(vatURL)
            .then(function (response) {
                //handle success
                const mainEmbed = new MessageEmbed()
                    .setColor('#3498DB')
                    .setTitle('VATSIM Roles')
                    .setDescription('Here are the roles you were given:');
                vatJSON = response;
                vatDat = vatJSON.data;

                vatPilot = vatDat.pilot;
                vatATC = vatDat.atc;
                vatIns = vatDat.i1;
                vatSup = vatDat.sup;

                //Check Pilot hours
                if (vatPilot > 1) {
                    memberTarget.roles.add(pilotRole);
                    console.log(message.author + " has been given the VATSIM Pilot role!");
                    mainEmbed.addField("VATSIM Pilot", "Has been given", true);
                } else {
                    console.log(message.author + " does not have enough pilot hours");
                    mainEmbed.addField("VATSIM Pilot", "Not enough hours", true);
                }

                //Check ATC hours
                if (vatATC > 1) {
                    memberTarget.roles.add(atcRole);
                    console.log(message.author + " has been given the  VATSIM ATC role!");
                    mainEmbed.addField("VATSIM ATC", "Has been given", true);
                } else {
                    console.log(message.author + " does not have enough ATC hours");
                    mainEmbed.addField("VATSIM ATC", "Not enough hours", true);
                }

                //Check Instructor hours
                if (vatIns > 1) {
                    memberTarget.roles.add(insRole);
                    console.log(message.author + " has been given the VATSIM Instructor role");
                    mainEmbed.addField("VATSIM Instructor", "Has been Given", true);
                } else {
                    console.log(message.author + " does not have enough Instructor Hours");
                    mainEmbed.addField("VATSIM Instructor", "Not enough Hours", true);
                }

                //Check Supervisor hours
                if (vatSup > 1) {
                    memberTarget.roles.add(supRole);
                    console.log(message.author + " has been given the VATSIM Supervisor role");
                    mainEmbed.addField("VATSIM Supervisor", "Has Been Given", true);
                } else {
                    console.log(message.author + " does not have enough Supervisor Hours");
                    mainEmbed.addField("VATSIM Supervisor", "Not enough Hours", true);
                }

                message.channel.send({ embeds: [mainEmbed] });

            })


    }
}
