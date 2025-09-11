"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import DecryptedText from "@/components/bits/DecryptedText";

interface CipherResponse {
  success: boolean;
  result?: string;
  operation?: string;
  error?: string;
}

export function CipherComponent() {
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(3);
  const [usePbr, setUsePbr] = useState(true);
  const [blockSize, setBlockSize] = useState(8);
  const [encryptResult, setEncryptResult] = useState("");
  const [decryptResult, setDecryptResult] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [encryptError, setEncryptError] = useState("");
  const [decryptError, setDecryptError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleEncrypt = async () => {
    if (!plaintext.trim() || !password.trim()) {
      setEncryptError("Please enter both plaintext and password");
      return;
    }

    setIsEncrypting(true);
    setEncryptError("");
    setEncryptResult("");

    try {
      const response = await fetch("/api/cipher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: plaintext.trim(),
          password: password.trim(),
          operation: "encrypt",
          rounds: rounds,
          use_pbr: usePbr,
          block_size: blockSize,
        }),
      });

      const data: CipherResponse = await response.json();

      if (data.success && data.result) {
        setEncryptResult(data.result);
      } else {
        setEncryptError(data.error || "Encryption failed");
      }
    } catch {
      setEncryptError("Failed to connect to cipher API. Please try again.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!ciphertext.trim() || !password.trim()) {
      setDecryptError("Please enter both ciphertext and password");
      return;
    }

    setIsDecrypting(true);
    setDecryptError("");
    setDecryptResult("");

    try {
      const response = await fetch("/api/cipher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: ciphertext.trim(),
          password: password.trim(),
          operation: "decrypt",
          rounds: rounds,
          use_pbr: usePbr,
          block_size: blockSize,
        }),
      });

      const data: CipherResponse = await response.json();

      if (data.success && data.result !== undefined) {
        setDecryptResult(data.result);
      } else {
        setDecryptError(data.error || "Decryption failed");
      }
    } catch {
      setDecryptError("Failed to connect to cipher API. Please try again.");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          <DecryptedText
            text="Enhanced AVS Cipher"
            speed={80}
            maxIterations={20}
            sequential={true}
            revealDirection="center"
            useOriginalCharsOnly={false}
            characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+"
            className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
            encryptedClassName="text-muted-foreground"
            animateOn="view"
          />
        </h1>
        <p className="text-muted-foreground text-lg">
          Advanced encryption with PBR integration featuring multi-round,
          polyalphabetic substitution and block transposition
        </p>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cipher Settings
          </CardTitle>
          <CardDescription>
            Configure your encryption parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rounds">Number of Rounds</Label>
              <Input
                id="rounds"
                type="number"
                min="1"
                max="10"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* PBR Enhancement Settings */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="use-pbr" className="text-sm font-medium">
                Enable PBR Enhancement
              </Label>
              <input
                id="use-pbr"
                type="checkbox"
                checked={usePbr}
                onChange={(e) => setUsePbr(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
              />
            </div>

            {usePbr && (
              <div className="space-y-2">
                <Label htmlFor="block-size">Block Size</Label>
                <Input
                  id="block-size"
                  type="number"
                  min="1"
                  max="32"
                  value={blockSize}
                  onChange={(e) => setBlockSize(parseInt(e.target.value) || 8)}
                  placeholder="8"
                />
                <p className="text-xs text-muted-foreground">
                  PBR (Polyalphabetic Block-Reverse) adds polyalphabetic
                  substitution and block transposition for enhanced security.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encryption Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Encrypt Text
            </CardTitle>
            <CardDescription>
              Convert your plaintext into encrypted ciphertext
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plaintext">Plaintext</Label>
              <Textarea
                id="plaintext"
                placeholder="Enter text to encrypt..."
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button
              onClick={handleEncrypt}
              disabled={isEncrypting || !plaintext.trim() || !password.trim()}
              className="w-full"
            >
              {isEncrypting ? "Encrypting..." : "Encrypt"}
            </Button>

            {encryptError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {encryptError}
              </div>
            )}

            {encryptResult && (
              <div className="space-y-2">
                <Label>Encrypted Result</Label>
                <div className="relative">
                  <div className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm pr-10">
                    <DecryptedText
                      text={encryptResult}
                      speed={30}
                      maxIterations={15}
                      sequential={true}
                      revealDirection="start"
                      useOriginalCharsOnly={false}
                      characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
                      className="text-green-600 dark:text-green-400 font-mono"
                      encryptedClassName="text-muted-foreground font-mono"
                      animateOn="view"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(encryptResult, "encrypt")}
                  >
                    {copied === "encrypt" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decryption Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Decrypt Text
            </CardTitle>
            <CardDescription>
              Convert your ciphertext back to readable plaintext
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ciphertext">Ciphertext</Label>
              <Textarea
                id="ciphertext"
                placeholder="Enter Base64 ciphertext to decrypt..."
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                className="min-h-32"
              />
            </div>

            <Button
              onClick={handleDecrypt}
              disabled={isDecrypting || !ciphertext.trim() || !password.trim()}
              className="w-full"
              variant="secondary"
            >
              {isDecrypting ? "Decrypting..." : "Decrypt"}
            </Button>

            {decryptError && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {decryptError}
              </div>
            )}

            {decryptResult && (
              <div className="space-y-2">
                <Label>Decrypted Result</Label>
                <div className="relative">
                  <div className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm pr-10">
                    <DecryptedText
                      text={decryptResult}
                      speed={40}
                      maxIterations={12}
                      sequential={true}
                      revealDirection="start"
                      useOriginalCharsOnly={true}
                      className="text-blue-600 dark:text-blue-400"
                      encryptedClassName="text-muted-foreground"
                      animateOn="view"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(decryptResult, "decrypt")}
                  >
                    {copied === "decrypt" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Status Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              Make sure the Python API server is running on{" "}
              <code className="px-1 py-0.5 bg-muted rounded text-xs">
                http://localhost:8000
              </code>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
