/**
 * Test component for beneficiaries collection
 * Bu component beneficiaries collection'ını test eder
 */

import React, { useState, useEffect } from 'react';
import { beneficiariesService } from './services/beneficiariesService';

const BeneficiariesTestComponent = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    testBeneficiariesCollection();
  }, []);

  const testBeneficiariesCollection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection
      const connectionResult = await beneficiariesService.testConnection();
      setTestResult(connectionResult);

      if (connectionResult.exists) {
        // Get beneficiaries
        const result = await beneficiariesService.getAll();
        if (result.data) {
          setBeneficiaries(result.data);
        } else {
          setError(result.error);
        }
      } else {
        setError(connectionResult.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTestBeneficiary = async () => {
    try {
      const testBeneficiary = {
        name: "Test İhtiyaç Sahibi",
        tc_number: "12345678999",
        phone: "05329998877",
        email: "test@kafkasder.org",
        address: "Test Mahallesi, Test Caddesi No:1, Test/İstanbul",
        status: "active",
        created_at: new Date().toISOString()
      };

      const result = await beneficiariesService.create(testBeneficiary);
      if (result.data) {
        alert('✅ Test ihtiyaç sahibi başarıyla oluşturuldu!');
        testBeneficiariesCollection(); // Refresh list
      } else {
        alert('❌ Hata: ' + result.error);
      }
    } catch (err) {
      alert('❌ Beklenmeyen hata: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>🧪 Beneficiaries Collection Test</h2>
        <p>⏳ Test ediliyor...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🧪 Beneficiaries Collection Test</h2>
      
      {/* Connection Test Result */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '5px',
        backgroundColor: testResult?.exists ? '#d4edda' : '#f8d7da'
      }}>
        <h3>📡 Bağlantı Testi</h3>
        <p><strong>Durum:</strong> {testResult?.exists ? '✅ Başarılı' : '❌ Başarısız'}</p>
        {testResult?.error && <p><strong>Hata:</strong> {testResult.error}</p>}
        {testResult?.data && <p><strong>Veri:</strong> {JSON.stringify(testResult.data)}</p>}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          border: '1px solid #dc3545', 
          borderRadius: '5px',
          backgroundColor: '#f8d7da',
          color: '#721c24'
        }}>
          <h3>❌ Hata</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testBeneficiariesCollection}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔄 Test Et
        </button>
        
        <button 
          onClick={addTestBeneficiary}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ➕ Test Verisi Ekle
        </button>
      </div>

      {/* Beneficiaries List */}
      <div>
        <h3>👥 İhtiyaç Sahipleri ({beneficiaries.length})</h3>
        {beneficiaries.length === 0 ? (
          <p>📭 Henüz ihtiyaç sahibi bulunmuyor.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {beneficiaries.map((beneficiary, index) => (
              <div 
                key={beneficiary.id || index}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <h4>{beneficiary.name || beneficiary.ad}</h4>
                <p><strong>TC:</strong> {beneficiary.tc_number || beneficiary.tcNo}</p>
                <p><strong>Telefon:</strong> {beneficiary.phone || beneficiary.telefon}</p>
                <p><strong>Email:</strong> {beneficiary.email || beneficiary.ePosta}</p>
                <p><strong>Durum:</strong> {beneficiary.status || beneficiary.durum}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiariesTestComponent;
