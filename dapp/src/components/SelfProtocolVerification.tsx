"use client";

import React, { useState, useEffect, useMemo } from "react";
// @ts-ignore
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  countries, 
  getUniversalLink,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Copy, ExternalLink, Loader2 } from 'lucide-react';

// Type definitions for Self Protocol
type SelfApp = any;

interface SelfProtocolVerificationProps {
  onVerificationComplete: (verified: boolean, userAddress?: string) => void;
  onBack?: () => void;
  userAddress?: string;
  contract?: ethers.Contract | null;
}

// ProofOfHuman contract details
const PROOF_OF_HUMAN_ADDRESS = "0xa46fbeC38d888c37b4310a145745CF947d83a0eB";
const PROOF_OF_HUMAN_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isUserVerified",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "verifiedUsers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "userIdentifier",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minimumAge",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "issueTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expirationTime",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "ofacMatch",
        "type": "bool"
      },
      {
        "internalType": "uint256[]",
        "name": "excludedCountries",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function SelfProtocolVerification({ 
  onVerificationComplete, 
  onBack, 
  userAddress
}: SelfProtocolVerificationProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingContract, setCheckingContract] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [proofOfHumanContract, setProofOfHumanContract] = useState<ethers.Contract | null>(null);
  
  // Use the provided userAddress or fallback to a default
  const userId = userAddress || '0x22861655b864Bdb2675F56CDa9D35EE2a2d6bF3c';
  
  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // Initialize ProofOfHuman contract
  useEffect(() => {
    const initializeContract = async () => {
      if (!window.ethereum || !userAddress) {
        setCheckingContract(false);
        setIsLoading(false);
        return;
      }

      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        const pohContract = new ethers.Contract(PROOF_OF_HUMAN_ADDRESS, PROOF_OF_HUMAN_ABI, signer);
        setProofOfHumanContract(pohContract);
      } catch (error) {
        console.error("Failed to initialize ProofOfHuman contract:", error);
      }
    };

    initializeContract();
  }, [userAddress]);

  // Check if user is already verified on the contract
  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!proofOfHumanContract || !userAddress) {
        setCheckingContract(false);
        return;
      }

      try {
        setCheckingContract(true);
        displayToast("Checking your verification status...");
        
        const isVerifiedOnChain = await proofOfHumanContract.isUserVerified(userAddress);
        
        if (isVerifiedOnChain) {
          // User is already verified, proceed directly
          setIsVerified(true);
          displayToast("You are already verified! Proceeding...");
          setTimeout(() => {
            onVerificationComplete(true, userAddress);
          }, 1500);
        } else {
          // User is not verified, show QR code for verification
          setShowQRCode(true);
          initializeSelfApp();
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        displayToast("Error checking verification status. Showing QR code...");
        setShowQRCode(true);
        initializeSelfApp();
      } finally {
        setCheckingContract(false);
      }
    };

    if (proofOfHumanContract) {
      checkVerificationStatus();
    }
  }, [proofOfHumanContract, userAddress]);

  // Initialize Self app for QR code generation
  const initializeSelfApp = () => {
    try {
      setIsLoading(true);
      const app = new SelfAppBuilder({
        version: 2,
        appName: import.meta.env.VITE_SELF_APP_NAME || "Self Workshop",
        scope: import.meta.env.VITE_SELF_SCOPE || "self-workshop",
        endpoint: `${import.meta.env.VITE_SELF_ENDPOINT}`,
        logoBase64:
          "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "Incident Management System Identity Verification",
        disclosures: {
          // what you want to verify from users' identity
          minimumAge: 18,
          // ofac: true,
          excludedCountries: excludedCountries,
          // what you want users to reveal
          // name: false,
          // issuing_state: true,
          // nationality: true,
          // date_of_birth: true,
          // passport_number: false,
          // gender: true,
          // expiry_date: false,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      displayToast("Failed to initialize verification system");
      setIsLoading(false);
    }
  };

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = async () => {
    setIsVerified(true);
    setShowQRCode(false); // Hide QR code immediately after success
    displayToast("Verification successful! Checking contract status...");
    
    // Wait a bit for the blockchain transaction to be mined
    setTimeout(async () => {
      await recheckContractVerification();
    }, 3000);
  };

  const recheckContractVerification = async () => {
    if (!proofOfHumanContract || !userAddress) {
      displayToast("Verification completed! You can now proceed.");
      setTimeout(() => {
        onVerificationComplete(true, userAddress);
      }, 1500);
      return;
    }

    try {
      displayToast("Confirming verification on blockchain...");
      
      // Check again if user is verified on contract
      const isVerifiedOnChain = await proofOfHumanContract.isUserVerified(userAddress);
      
      if (isVerifiedOnChain) {
        displayToast("Verification confirmed on blockchain! Proceeding...");
        setTimeout(() => {
          onVerificationComplete(true, userAddress);
        }, 1500);
      } else {
        // If not immediately verified, keep checking for a bit
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkInterval = setInterval(async () => {
          attempts++;
          
          try {
            const isVerified = await proofOfHumanContract.isUserVerified(userAddress);
            if (isVerified) {
              clearInterval(checkInterval);
              displayToast("Verification confirmed! Proceeding...");
              setTimeout(() => {
                onVerificationComplete(true, userAddress);
              }, 1500);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              displayToast("Verification completed! You can now proceed.");
              setTimeout(() => {
                onVerificationComplete(true, userAddress);
              }, 1500);
            }
          } catch (error) {
            console.error("Error checking verification:", error);
            if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              displayToast("Verification completed! You can now proceed.");
              setTimeout(() => {
                onVerificationComplete(true, userAddress);
              }, 1500);
            }
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error rechecking verification:", error);
      displayToast("Verification completed! You can now proceed.");
      setTimeout(() => {
        onVerificationComplete(true, userAddress);
      }, 1500);
    }
  };

  const handleVerificationError = () => {
    displayToast("Error: Failed to verify identity. Please try again.");
  };

  const handleSkipVerification = () => {
    // For testing purposes - in production you might want to remove this
    onVerificationComplete(false);
  };

  // Show loading state while checking contract
  if (checkingContract) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Checking Verification Status</h2>
          <p className="text-gray-600">
            Please wait while we check if you're already verified...
          </p>
        </div>
      </div>
    );
  }

  // Show success state for verified users (either pre-verified or just verified)
  if (isVerified) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {showQRCode ? "Verification Successful!" : "Already Verified!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {showQRCode 
              ? "Your identity has been verified using Self Protocol. Processing..." 
              : "Your identity is already verified with Self Protocol. You can proceed with the incident report."}
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Verified User</span>
            </div>
          </div>

          {showQRCode && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">Confirming verification on blockchain...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show QR code verification flow
  if (!showQRCode) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Initializing Verification</h2>
          <p className="text-gray-600">
            Setting up your verification process...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Identity Verification Required</h2>
        <p className="text-gray-600">
          Complete your identity verification to proceed with incident reporting
        </p>
      </div>

      {/* Verification Benefits */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Enhanced Security</h3>
          <p className="text-sm text-gray-600">Cryptographic proof of identity</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Credible Reports</h3>
          <p className="text-sm text-gray-600">Verified user submissions</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Privacy Preserved</h3>
          <p className="text-sm text-gray-600">Zero-knowledge verification</p>
        </div>
      </div>

      {/* Main verification content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        {isLoading ? (
          <div className="text-center">
            <div className="w-64 h-64 bg-gray-200 animate-pulse flex items-center justify-center mx-auto rounded-lg mb-6">
              <p className="text-gray-500 text-sm">Initializing verification system...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              {selfApp ? (
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <div className="relative">
                    <React.Suspense fallback={
                      <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                        <p className="text-gray-500 text-sm">Loading QR Code...</p>
                      </div>
                    }>
                      <SelfQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={handleSuccessfulVerification}
                        onError={handleVerificationError}
                      />
                    </React.Suspense>
                  </div>
                </div>
              ) : (
                <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center rounded-lg">
                  <p className="text-gray-500 text-sm">Failed to load QR Code</p>
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Scan QR Code with Self Protocol App
              </h3>
              <p className="text-gray-600 text-sm">
                Use the Self Protocol mobile app to scan the QR code above and complete your identity verification
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!universalLink}
                className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-3 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{linkCopied ? "Copied!" : "Copy Universal Link"}</span>
              </button>

              <button
                type="button"
                onClick={openSelfApp}
                disabled={!universalLink}
                className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-3 rounded-lg text-sm font-medium disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Self App</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-500 text-xs uppercase tracking-wide">User Address</span>
                <div className="bg-white rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
                  {userId ? userId : <span className="text-gray-400">Not connected</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Information section */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">About Self Protocol Verification</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Verifies you are 18+ years old</li>
              <li>• Ensures you're not in restricted countries</li>
              <li>• Uses zero-knowledge proofs to protect your privacy</li>
              <li>• Creates cryptographic proof of your identity without revealing personal information</li>
              <li>• One-time verification that persists for future reports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Development/Testing Skip Option */}
      {import.meta.env.DEV && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Development Mode</p>
              <p className="text-amber-700 mb-3">
                For testing purposes, you can skip verification. In production, this option will not be available.
              </p>
              <button
                onClick={handleSkipVerification}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Skip Verification (Development Only)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}
        
        <div className="text-center text-sm text-gray-500">
          Complete verification to proceed with incident reporting
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}