#!/usr/bin/env node

import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68e92f380024d5de7dfa')
    .setKey('standard_c66e7bdaffc6418a65467b95710c77aef7c534221bb554d069b9d9f93a1637dc5ccd1811cac2f4b1b1677df0882df9c76fcf4db8fa33d488543d0984ff4c697231ec10a305cfb1c6c32b49adb18c0f4b8203f8bd2451c983da3ea877a2458ef4f51c8f5c34798244ad41141da9646f6b4c5a89fabb92d1fd16c35adbc4dab6cc');

const databases = new Databases(client);

const DATABASE_ID = '68e9310d0008e60db79f';

async function updateTestDoc() {
    try {
        console.log('Test dokümanı güncelleniyor...');
        
        // Mevcut dokümanı güncelle
        const updatedDoc = await databases.updateDocument(
            DATABASE_ID,
            'user_profiles',
            '68e93e8a0ccefd2f9443',
            {
                email: 'test@kafkasderpanel.com',
                avatar_url: '',
                is_active: true,
                metadata: '{"permissions": ["read"]}'
            }
        );
        
        console.log('Doküman güncellendi:', updatedDoc.$id);
        console.log('Email:', updatedDoc.email);
        
    } catch (error) {
        console.error('Hata:', error.message);
        if (error.code) {
            console.error('Hata kodu:', error.code);
        }
    }
}

updateTestDoc();
