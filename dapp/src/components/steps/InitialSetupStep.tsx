import { useState } from 'react';
import { Wallet, Cloud, ArrowRight, CheckCircle, AlertTriangle, Shield } from 'lucide-react';
import { ethers } from 'ethers';
import StorachaConnection from '../StorachaConnection';
import type { StorachaCredentials } from '../StorachaConnection';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface InitialSetupStepProps {
  onNext: (setupData: { walletAddress: string; contract: ethers.Contract; storachaCredentials: StorachaCredentials }) => void;
}

const contractAddress = "0x2cEA78491DFb4eecB061FcB669d148977EB8a950";

const abi: any[] = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IncidentReported",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getIncident",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "incidentCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "incidents",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "reportIncident",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function InitialSetupStep({ onNext }: InitialSetupStepProps) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  
  const [storachaCredentials, setStorachaCredentials] = useState<StorachaCredentials | null>(null);
  const [isStorachaConnected, setIsStorachaConnected] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue");
      return;
    }

    setIsConnectingWallet(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, abi, signer);
      
      setContract(contractInstance);
      setWalletAddress(accounts[0]);
      setWalletConnected(true);
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleStorachaConnect = (credentials: StorachaCredentials) => {
    if (credentials.email && credentials.spaceDID) {
      setStorachaCredentials(credentials);
      setIsStorachaConnected(true);
    } else {
      setStorachaCredentials(null);
      setIsStorachaConnected(false);
    }
  };

  const handleContinue = () => {
    if (walletConnected && isStorachaConnected && contract && storachaCredentials) {
      onNext({
        walletAddress,
        contract,
        storachaCredentials
      });
    }
  };

  const canContinue = walletConnected && isStorachaConnected && contract && storachaCredentials;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Required Services</h2>
        <p className="text-gray-600">
          Connect your wallet and storage account to report incidents securely
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 transition-colors ${
          walletConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            {walletConnected ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Wallet className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">Wallet Connection</h3>
              <p className="text-sm text-gray-600">
                {walletConnected ? 'Connected to blockchain' : 'Required for transaction signing'}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 transition-colors ${
          isStorachaConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            {isStorachaConnected ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Cloud className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">Storage Account</h3>
              <p className="text-sm text-gray-600">
                {isStorachaConnected ? 'Connected to IPFS storage' : 'Required for secure document storage'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection Section */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Wallet className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Connect Your Wallet</h3>
            </div>
            {walletConnected && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          {!walletConnected ? (
            <div>
              <p className="text-gray-600 mb-4">
                Connect your MetaMask wallet to sign transactions and interact with the Celo blockchain.
              </p>
              <button
                onClick={connectWallet}
                disabled={isConnectingWallet}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isConnectingWallet ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Wallet Connected</p>
                  <p className="text-sm text-green-700">
                    Address: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Storacha Connection Section */}
      <div className="mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Cloud className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Connect Storage Account</h3>
            </div>
            {isStorachaConnected && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Connected
              </span>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              Connect your Web3.Storage (Storacha) account to securely store incident reports on IPFS.
            </p>
            
            <StorachaConnection
              onConnect={handleStorachaConnect}
              isConnected={isStorachaConnected}
              credentials={storachaCredentials || undefined}
            />
          </div>
        </div>
      </div>

      {/* Requirements Info */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why These Connections Are Required</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Wallet:</strong> Signs blockchain transactions to permanently record incident reports</li>
              <li>• <strong>Storage:</strong> Securely stores PDF reports on decentralized IPFS network</li>
              <li>• <strong>Security:</strong> Ensures data integrity and immutable timestamping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`font-semibold py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center space-x-2 ${
            canContinue
              ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:-translate-y-0.5 focus:ring-4 focus:ring-blue-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Continue to Incident Details</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {!canContinue && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">Please complete both connections to continue</span>
          </div>
        </div>
      )}
    </div>
  );
}