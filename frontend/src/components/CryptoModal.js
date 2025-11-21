// src/components/CryptoModal.js

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  FormControl,    
  InputLabel,      
  Select,          
  MenuItem         
  
} from '@mui/material';
import axios from 'axios';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css'; // styling for the dropdown

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { BrowserProvider, Contract, parseUnits } from 'ethers';

import TokenABI from "../utils/ABI.json"

const projectId = "df8cb4fb25bd233a5125ccd99de3edcd";

const mainnet = {
  chainId: 56,
  name: "BSC ",
  currency: "BNB",
  explorerUrl: "https://bscscan.com",
  rpcUrl: "https://bsc-dataseed.binance.org/",
};

const testnet = {
  chainId: 97,
  name: "BSC Testnet",
  currency: "tBNB",
  explorerUrl: "https://testnet.bscscan.com/",
  rpcUrl: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
};

const metadata = {
  name: "My Website",
  description: "My Website description",
  url: "https://www.themecrypto.it",
  icons: ["https://avatars.mywebsite.com/"],
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: "...",
  defaultChainId: 1,
});

createWeb3Modal({
  ethersConfig,
  chains: [testnet],
  projectId,
  enableAnalytics: true,
});

import { useWeb3Modal } from '@web3modal/ethers/react';
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useWeb3ModalProvider } from '@web3modal/ethers/react';

export default function CryptoModal({ isOpen, onClose, mergedCart }) {
    // Shipping form state
    const [shipping, setShipping] = useState({
      name: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    });
  
    // Token selector
    const [selectedToken, setSelectedToken] = useState('USDT');
  
    // Wallet connect hooks
    const { open: openWalletModal } = useWeb3Modal();
    const { walletProvider } = useWeb3ModalProvider();
    const provider = walletProvider ? new BrowserProvider(walletProvider) : null;
  
    const handleChange = e =>
      setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
    // Compute totals
    const subtotal = mergedCart.reduce(
      (sum, item) => sum + (item.price * item.quantity || 0),
      0
    );
    const shippingCost = subtotal >= 100 ? 0 : 5.99;
    const total = (subtotal + shippingCost).toFixed(2);
  
    // Validate form + wallet
    const isFormValid =
      Object.values(shipping).every(v => v.trim() !== '') && Boolean(provider);
  
    const handleConfirm = async () => {
      // 1) On-chain token transfer
      console.log("ciao");
      try {
        const signer = await provider.getSigner();
        // pick address from env
        const tokenAddress =
          selectedToken === 'USDT'
            ? process.env.REACT_APP_USDT_ADDRESS
            : process.env.REACT_APP_USDC_ADDRESS;

        console.log(tokenAddress);
  
        const token = new Contract(tokenAddress, TokenABI, signer);

        console.log(token);
        // parseUnits with 18 decimals
        const amount = parseUnits(total, 18);
        const tx = await token.transfer(
          process.env.REACT_APP_RECEIVER_ADDRESS,
          amount
        );
        await tx.wait();
      } catch (err) {
        console.error('Token transfer failed:', err);
        alert('Crypto payment failed. Please try again.');
        return;
      }
  
      // 2) Build shipping payload in Stripe format
      const shippingPayload = {
        name: shipping.name,
        phone: shipping.phone,
        address: {
          line1: shipping.addressLine1,
          line2: shipping.addressLine2,
          city: shipping.city,
          state: shipping.state,
          country: shipping.country,
          postal_code: shipping.postalCode
        },
        carrier: null,
        tracking_number: null
      };
  
      // 3) Post order to backend
      const products = mergedCart.map(item => ({
        name: `${item.model?.name || 'Model'} – ${item.material?.name || 'Material'}`,
        price: item.price,
        quantity: item.quantity
      }));
  
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/orders`, {
          products,
          paymentStatus: 'paid',
          orderStatus: 'Pending',
          shippingInfo: shippingPayload,
          billingInfo: null,
          paymentIntent: selectedToken  // record which token was used
        });
        alert('Order created successfully!');
        localStorage.removeItem('cart');
        window.location.reload();
      } catch (err) {
        console.error('Order creation failed:', err);
        alert('Order creation failed after payment.');
      }
    };
  
    return (
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 2 }}  // ensure WalletConnect pops above
      >
        <DialogTitle>Pay with Crypto</DialogTitle>
        <DialogContent>
          {/* Totals */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Subtotal: ${subtotal.toFixed(2)}
            </Typography>
            <Typography variant="subtitle1">
              Shipping: {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
            </Typography>
            <Typography variant="h6" sx={{ mt: 1 }}>
              Total: ${total}
            </Typography>
          </Box>
  
          {/* Token selector */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Token</InputLabel>
            <Select
              value={selectedToken}
              label="Token"
              onChange={e => setSelectedToken(e.target.value)}
            >
              <MenuItem value="USDT">USDT</MenuItem>
              <MenuItem value="USDC">USDC</MenuItem>
            </Select>
          </FormControl>
  
          {/* Shipping form */}
          <Typography sx={{ mt: 2 }}>Shipping Information:</Typography>
          <TextField
            label="Name"
            name="name"
            value={shipping.name}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <PhoneInput
            country={'us'}                    // default country
            value={shipping.phone}
            onChange={phone => setShipping({ ...shipping, phone })}
            preferredCountries={['us','gb','de','fr']}
            enableSearch                     // searchable dropdown
            inputStyle={{ width: '100%' }}
            containerStyle={{ marginTop: 8, marginBottom: 16 }}
        />
          <TextField
            label="Address Line 1"
            name="addressLine1"
            value={shipping.addressLine1}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Address Line 2"
            name="addressLine2"
            value={shipping.addressLine2}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="City"
            name="city"
            value={shipping.city}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="State"
            name="state"
            value={shipping.state}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Postal Code"
            name="postalCode"
            value={shipping.postalCode}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
          <TextField
            label="Country"
            name="country"
            value={shipping.country}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
        </DialogContent>
  
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
  
          {!provider ? (
            <Button variant="contained" onClick={openWalletModal}>
              Connect Wallet
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!isFormValid}
            >
              Confirm Payment
            </Button>
          )}
        </DialogActions>
      </Dialog>
    );
  }
