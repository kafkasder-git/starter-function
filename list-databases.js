#!/usr/bin/env node

import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68e92f380024d5de7dfa')
    .setKey('standard_c66e7bdaffc6418a65467b95710c77aef7c534221bb554d069b9d9f93a1637dc5ccd1811cac2f4b1b1677df0882df9c76fcf4db8fa33d488543d0984ff4c697231ec10a305cfb1c6c32b49adb18c0f4b8203f8bd2451c983da3ea877a2458ef4f51c8f5c34798244ad41141da9646f6b4c5a89fabb92d1fd16c35adbc4dab6cc');

const databases = new Databases(client);

async function listDatabases() {
    try {
        console.log('Mevcut veritabanları listeleniyor...');
        const result = await databases.list();
        
        if (result.databases.length === 0) {
            console.log('Hiç veritabanı bulunamadı.');
        } else {
            console.log(`Toplam ${result.databases.length} veritabanı bulundu:`);
            result.databases.forEach((db, index) => {
                console.log(`${index + 1}. ${db.name} (${db.$id})`);
                console.log(`   Oluşturulma: ${db.$createdAt}`);
            });
        }
    } catch (error) {
        console.error('Hata:', error.message);
        if (error.code) {
            console.error('Hata kodu:', error.code);
        }
    }
}

listDatabases();
