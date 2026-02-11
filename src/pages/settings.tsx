import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppSettings, useUpdateSetting } from "@/hooks/use-app-settings"
import type { PointsEarnRate, MessagingProviderConfig, StoreInfo } from "@/types/database.types"

export default function Settings() {
  const { data: settings, isLoading, refetch } = useAppSettings()
  const { mutate: updateSetting } = useUpdateSetting()

  // Store Info
  const [storeName, setStoreName] = useState("")
  const [storePhone, setStorePhone] = useState("")
  const [storeAddress, setStoreAddress] = useState("")

  // Points Config
  const [pointsPerDollar, setPointsPerDollar] = useState("1")

  // SMS Provider
  const [smsProvider, setSmsProvider] = useState<string>("none")
  const [smsApiKey, setSmsApiKey] = useState("")
  const [smsApiSecret, setSmsApiSecret] = useState("")
  const [smsFromNumber, setSmsFromNumber] = useState("")

  // Email Provider
  const [emailProvider, setEmailProvider] = useState<string>("none")
  const [emailApiKey, setEmailApiKey] = useState("")
  const [emailFromAddress, setEmailFromAddress] = useState("")
  const [emailFromName, setEmailFromName] = useState("")

  useEffect(() => {
    if (settings) {
      const store = settings.store_info as StoreInfo
      setStoreName(store.name || "")
      setStorePhone(store.phone || "")
      setStoreAddress(store.address || "")

      const points = settings.points_earn_rate as PointsEarnRate
      setPointsPerDollar(String(points.points_per_dollar || 1))

      const messaging = settings.messaging_provider as MessagingProviderConfig
      if (messaging?.sms) {
        setSmsProvider(messaging.sms.provider || "none")
        setSmsApiKey(messaging.sms.api_key || "")
        setSmsApiSecret(messaging.sms.api_secret || "")
        setSmsFromNumber(messaging.sms.from_number || "")
      }
      if (messaging?.email) {
        setEmailProvider(messaging.email.provider || "none")
        setEmailApiKey(messaging.email.api_key || "")
        setEmailFromAddress(messaging.email.from_address || "")
        setEmailFromName(messaging.email.from_name || "")
      }
    }
  }, [settings])

  async function saveStoreInfo() {
    try {
      await updateSetting("store_info", {
        name: storeName,
        phone: storePhone,
        address: storeAddress,
      })
      toast.success("Store info saved")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  async function savePointsConfig() {
    try {
      await updateSetting("points_earn_rate", {
        points_per_dollar: parseInt(pointsPerDollar) || 1,
      })
      toast.success("Points configuration saved")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  async function saveMessagingConfig() {
    try {
      await updateSetting("messaging_provider", {
        sms:
          smsProvider !== "none"
            ? {
                provider: smsProvider,
                api_key: smsApiKey,
                api_secret: smsApiSecret,
                from_number: smsFromNumber,
              }
            : null,
        email:
          emailProvider !== "none"
            ? {
                provider: emailProvider,
                api_key: emailApiKey,
                from_address: emailFromAddress,
                from_name: emailFromName,
              }
            : null,
      })
      toast.success("Messaging configuration saved")
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your store and integrations.</p>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList>
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="sms">SMS Provider</TabsTrigger>
          <TabsTrigger value="email">Email Provider</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic information about your nail store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                />
              </div>
              <Button onClick={saveStoreInfo}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Points Configuration</CardTitle>
              <CardDescription>
                Set how many loyalty points customers earn per dollar spent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Points per Dollar</Label>
                <Input
                  type="number"
                  min="1"
                  value={pointsPerDollar}
                  onChange={(e) => setPointsPerDollar(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Customers will earn {pointsPerDollar || 1} point(s) for every $1 spent.
                </p>
              </div>
              <Button onClick={savePointsConfig}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>SMS Provider</CardTitle>
              <CardDescription>
                Configure your SMS provider for sending text message campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={smsProvider} onValueChange={setSmsProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (not configured)</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="vonage">Vonage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {smsProvider !== "none" && (
                <>
                  <div className="space-y-2">
                    <Label>API Key / Account SID</Label>
                    <Input
                      type="password"
                      value={smsApiKey}
                      onChange={(e) => setSmsApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>API Secret / Auth Token</Label>
                    <Input
                      type="password"
                      value={smsApiSecret}
                      onChange={(e) => setSmsApiSecret(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Number</Label>
                    <Input
                      placeholder="+1234567890"
                      value={smsFromNumber}
                      onChange={(e) => setSmsFromNumber(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={saveMessagingConfig}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Provider</CardTitle>
              <CardDescription>
                Configure your email provider for sending email campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={emailProvider} onValueChange={setEmailProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (not configured)</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {emailProvider !== "none" && (
                <>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={emailApiKey}
                      onChange={(e) => setEmailApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email Address</Label>
                    <Input
                      placeholder="hello@yournailstore.com"
                      value={emailFromAddress}
                      onChange={(e) => setEmailFromAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      placeholder="Nail Store"
                      value={emailFromName}
                      onChange={(e) => setEmailFromName(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button onClick={saveMessagingConfig}>Save</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
