#!/usr/bin/env node
/* eslint-disable import/prefer-default-export */
const { networkInterfaces } = require('os');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromisified = promisify(exec);

// eslint-disable-next-line consistent-return
module.exports = async function getIp(command = 'dig +short myip.opendns.com @resolver1.opendns.com') {
    try {
        const { stdout, stderr } = await execPromisified(command);
        if (stderr) {
            console.error(`stderr: \n${stderr}`);
            return undefined;
        }
        if (stdout) {
            process.env.HOST = stdout.trim();
            return stdout;
        }
    } catch (error) {
        const MAC = Object.values(networkInterfaces())
            .flat()
            ?.find(_interface => _interface?.mac !== '00:00:00:00:00:00')?.mac;
        if (!MAC) {
            console.error(`error: \n${error.message}`);
            console.error(`${_.now()} unable to fetch ip/MAC.`);
            console.error(`${_.now()} terminating process!!!!!!!.`);
            process.exit(1);
        }
        process.env.HOST = MAC;
        return MAC;
    }
};
