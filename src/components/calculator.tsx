"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SECRET_CODE = "1984=";

export default function Calculator() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [display, setDisplay] = useState("0");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (input.endsWith(SECRET_CODE)) {
      router.push("/login");
    }
  }, [input, router]);

  const handleButtonClick = (value: string) => {
    // Append the value to the secret input sequence
    setInput((prev) => prev + value);
    
    if (value === "C") {
      setDisplay("0");
      // Don't reset the secret input here, to allow codes like "123C45"
      return;
    }

    if (value === "=") {
      try {
        // This is a simplified eval, not safe for production
        // It's for demonstrating the camouflage functionality
        const result = new Function(`return ${display.replace(/--/g, '+')}`)();
        setDisplay(String(result));
      } catch (error) {
        setDisplay("Error");
      }
      return;
    }

    if (["+", "-", "*", "/"].includes(value)) {
       // If last char is an operator, replace it
      if (["+", "-", "*", "/"].includes(display.slice(-1))) {
        setDisplay(prev => prev.slice(0, -1) + value);
      } else {
        setDisplay((prev) => prev + value);
      }
      return;
    }

    if (display === "0" || display === "Error") {
      setDisplay(value);
    } else {
      setDisplay((prev) => prev + value);
    }
  };

  const buttons = [
    "C", "/", "*", "-",
    "7", "8", "9",
    "4", "5", "6",
    "+",
    "1", "2", "3",
    "=",
    "0", ".",
  ];

  if (!isClient) {
    return (
        <Card className="shadow-2xl animate-pulse">
            <CardHeader className="p-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-4 h-[52px]" />
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-2">
                    {buttons.map((btn) => (
                         <div key={btn} className={cn("h-16 rounded-md bg-gray-200 dark:bg-gray-700", {
                            "col-span-2": btn === "0",
                            "row-span-2 h-auto": btn === "=",
                        })} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="p-4">
        <div className="bg-muted rounded-md p-4 text-right">
          <p className="text-3xl font-mono text-foreground break-all h-8">
            {display}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 grid-rows-5 gap-2">
          
          {/* Row 1 */}
          <Button onClick={() => handleButtonClick("C")} variant="secondary" className="text-xl h-16">C</Button>
          <Button onClick={() => handleButtonClick("/")} variant="secondary" className="text-xl h-16">/</Button>
          <Button onClick={() => handleButtonClick("*")} variant="secondary" className="text-xl h-16">*</Button>
          <Button onClick={() => handleButtonClick("-")} variant="secondary" className="text-xl h-16">-</Button>

          {/* Row 2 */}
          <Button onClick={() => handleButtonClick("7")} variant="outline" className="text-xl h-16">7</Button>
          <Button onClick={() => handleButtonClick("8")} variant="outline" className="text-xl h-16">8</Button>
          <Button onClick={() => handleButtonClick("9")} variant="outline" className="text-xl h-16">9</Button>
          <Button onClick={() => handleButtonClick("+")} variant="secondary" className="text-xl h-auto row-span-2">+</Button>

          {/* Row 3 */}
          <Button onClick={() => handleButtonClick("4")} variant="outline" className="text-xl h-16">4</Button>
          <Button onClick={() => handleButtonClick("5")} variant="outline" className="text-xl h-16">5</Button>
          <Button onClick={() => handleButtonClick("6")} variant="outline" className="text-xl h-16">6</Button>
          
          {/* Row 4 */}
          <Button onClick={() => handleButtonClick("1")} variant="outline" className="text-xl h-16">1</Button>
          <Button onClick={() => handleButtonClick("2")} variant="outline" className="text-xl h-16">2</Button>
          <Button onClick={() => handleButtonClick("3")} variant="outline" className="text-xl h-16">3</Button>
          <Button onClick={() => handleButtonClick("=")} variant="secondary" className="text-xl h-auto row-span-2 !bg-accent !text-accent-foreground">=</Button>
          
          {/* Row 5 */}
          <Button onClick={() => handleButtonClick("0")} variant="outline" className="text-xl h-16 col-span-2">0</Button>
          <Button onClick={() => handleButtonClick(".")} variant="outline" className="text-xl h-16">.</Button>

        </div>
      </CardContent>
    </Card>
  );
}
