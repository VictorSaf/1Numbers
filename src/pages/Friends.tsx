// Friends Page
// Manage friends, send requests, compare numerology profiles

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends, Friend } from '@/hooks/useFriends';
import { FriendComparison } from '@/components/FriendComparison';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  Mail,
  Link as LinkIcon,
  Copy,
  Check,
  X,
  UserMinus,
  ChartBar,
  Clock,
  Loader2,
  AlertTriangle,
  Share2,
  QrCode,
} from 'lucide-react';

const Friends = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const {
    friends,
    receivedRequests,
    sentRequests,
    inviteLinks,
    counts,
    isLoading,
    error,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    generateInviteLink,
    deactivateInviteLink,
  } = useFriends();

  const [emailInput, setEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const translations: Record<string, Record<string, string>> = {
    ro: {
      title: 'Prieteni',
      description: 'Conectează-te cu prietenii și compară profilurile numerologice',
      myFriends: 'Prietenii Mei',
      requests: 'Cereri',
      inviteLinks: 'Link-uri Invitație',
      noFriends: 'Nu ai încă prieteni',
      noFriendsDesc: 'Invită-ți prietenii pentru a compara profilurile numerologice!',
      addFriend: 'Adaugă Prieten',
      addByEmail: 'Adaugă după Email',
      emailPlaceholder: 'email@exemplu.com',
      messagePlaceholder: 'Mesaj opțional...',
      sendRequest: 'Trimite Cerere',
      pendingRequests: 'Cereri Primite',
      sentRequests: 'Cereri Trimise',
      noPendingRequests: 'Nicio cerere în așteptare',
      noSentRequests: 'Nicio cerere trimisă',
      accept: 'Acceptă',
      reject: 'Respinge',
      pending: 'În așteptare',
      accepted: 'Acceptat',
      rejected: 'Respins',
      compare: 'Compară',
      remove: 'Elimină',
      generateInvite: 'Generează Link',
      copyLink: 'Copiază Link',
      copied: 'Copiat!',
      deactivate: 'Dezactivează',
      uses: 'utilizări',
      expires: 'expiră',
      noExpiry: 'nu expiră',
      noInviteLinks: 'Niciun link de invitație',
      generateInviteDesc: 'Generează un link pentru a invita prieteni',
      shareInvite: 'Distribuie Invitație',
      friendSince: 'Prieten din',
      comparison: 'Comparație',
      backToList: 'Înapoi la Listă',
      loginRequired: 'Trebuie să fii autentificat pentru a vedea prietenii',
    },
    en: {
      title: 'Friends',
      description: 'Connect with friends and compare numerology profiles',
      myFriends: 'My Friends',
      requests: 'Requests',
      inviteLinks: 'Invite Links',
      noFriends: 'No friends yet',
      noFriendsDesc: 'Invite your friends to compare numerology profiles!',
      addFriend: 'Add Friend',
      addByEmail: 'Add by Email',
      emailPlaceholder: 'email@example.com',
      messagePlaceholder: 'Optional message...',
      sendRequest: 'Send Request',
      pendingRequests: 'Received Requests',
      sentRequests: 'Sent Requests',
      noPendingRequests: 'No pending requests',
      noSentRequests: 'No sent requests',
      accept: 'Accept',
      reject: 'Reject',
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      compare: 'Compare',
      remove: 'Remove',
      generateInvite: 'Generate Link',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      deactivate: 'Deactivate',
      uses: 'uses',
      expires: 'expires',
      noExpiry: 'no expiry',
      noInviteLinks: 'No invite links',
      generateInviteDesc: 'Generate a link to invite friends',
      shareInvite: 'Share Invite',
      friendSince: 'Friend since',
      comparison: 'Comparison',
      backToList: 'Back to List',
      loginRequired: 'You must be logged in to see friends',
    },
    ru: {
      title: 'Друзья',
      description: 'Свяжитесь с друзьями и сравните нумерологические профили',
      myFriends: 'Мои Друзья',
      requests: 'Запросы',
      inviteLinks: 'Ссылки Приглашения',
      noFriends: 'Пока нет друзей',
      noFriendsDesc: 'Пригласите друзей для сравнения нумерологических профилей!',
      addFriend: 'Добавить Друга',
      addByEmail: 'Добавить по Email',
      emailPlaceholder: 'email@пример.com',
      messagePlaceholder: 'Необязательное сообщение...',
      sendRequest: 'Отправить Запрос',
      pendingRequests: 'Полученные Запросы',
      sentRequests: 'Отправленные Запросы',
      noPendingRequests: 'Нет ожидающих запросов',
      noSentRequests: 'Нет отправленных запросов',
      accept: 'Принять',
      reject: 'Отклонить',
      pending: 'Ожидание',
      accepted: 'Принято',
      rejected: 'Отклонено',
      compare: 'Сравнить',
      remove: 'Удалить',
      generateInvite: 'Создать Ссылку',
      copyLink: 'Копировать Ссылку',
      copied: 'Скопировано!',
      deactivate: 'Деактивировать',
      uses: 'использований',
      expires: 'истекает',
      noExpiry: 'бессрочно',
      noInviteLinks: 'Нет ссылок приглашения',
      generateInviteDesc: 'Создайте ссылку для приглашения друзей',
      shareInvite: 'Поделиться Приглашением',
      friendSince: 'Друг с',
      comparison: 'Сравнение',
      backToList: 'Назад к Списку',
      loginRequired: 'Вы должны войти, чтобы увидеть друзей',
    },
  };

  const t = translations[language] || translations.en;

  const handleSendRequest = async () => {
    if (!emailInput.trim()) return;
    setSendingRequest(true);
    const success = await sendFriendRequest(emailInput.trim(), messageInput.trim() || undefined);
    if (success) {
      setEmailInput('');
      setMessageInput('');
    }
    setSendingRequest(false);
  };

  const handleGenerateInvite = async () => {
    setGeneratingLink(true);
    await generateInviteLink();
    setGeneratingLink(false);
    setInviteDialogOpen(false);
  };

  const handleCopyLink = (link: string, code: string) => {
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t.loginRequired}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show comparison view if a friend is selected
  if (selectedFriend && user.birthDate && user.fullName) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => setSelectedFriend(null)}
          className="mb-4"
        >
          &larr; {t.backToList}
        </Button>
        <FriendComparison
          user={{
            birthDate: user.birthDate,
            fullName: user.fullName,
          }}
          friend={{
            birthDate: selectedFriend.birthDate,
            fullName: selectedFriend.fullName,
            email: selectedFriend.email,
          }}
          friendName={selectedFriend.fullName}
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Users className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground">{t.description}</p>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t.myFriends}
            {counts.friendsCount > 0 && (
              <Badge variant="secondary">{counts.friendsCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t.requests}
            {counts.pendingRequestsCount > 0 && (
              <Badge variant="destructive">{counts.pendingRequestsCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            {t.inviteLinks}
          </TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-4">
          {/* Add Friend Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                {t.addByEmail}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.addByEmail}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={t.messagePlaceholder}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendRequest}
                disabled={!emailInput.trim() || sendingRequest}
              >
                {sendingRequest ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                {t.sendRequest}
              </Button>
            </CardContent>
          </Card>

          {/* Friends List */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : friends.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.noFriends}</h3>
                <p className="text-muted-foreground">{t.noFriendsDesc}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-semibold">{friend.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.friendSince} {new Date(friend.friendshipDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFriend(friend)}
                      >
                        <ChartBar className="h-4 w-4 mr-1" />
                        {t.compare}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {/* Received Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.pendingRequests}</CardTitle>
            </CardHeader>
            <CardContent>
              {receivedRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t.noPendingRequests}
                </p>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{request.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        {request.message && (
                          <p className="text-sm mt-1 italic">"{request.message}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRequest(request.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {t.accept}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectRequest(request.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {t.reject}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sent Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.sentRequests}</CardTitle>
            </CardHeader>
            <CardContent>
              {sentRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {t.noSentRequests}
                </p>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{request.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'accepted'
                            ? 'default'
                            : request.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {request.status === 'accepted'
                          ? t.accepted
                          : request.status === 'rejected'
                          ? t.rejected
                          : t.pending}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Links Tab */}
        <TabsContent value="invite" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {t.shareInvite}
              </CardTitle>
              <CardDescription>{t.generateInviteDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    {t.generateInvite}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.generateInvite}</DialogTitle>
                    <DialogDescription>{t.generateInviteDesc}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={handleGenerateInvite}
                      disabled={generatingLink}
                    >
                      {generatingLink ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      {t.generateInvite}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Existing Invite Links */}
          {inviteLinks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t.noInviteLinks}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {inviteLinks.map((link) => (
                <Card key={link.id} className={!link.isActive ? 'opacity-50' : ''}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="font-mono text-lg">{link.code}</div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{link.usesCount} {t.uses}</span>
                        <span>
                          {link.expiresAt
                            ? `${t.expires}: ${new Date(link.expiresAt).toLocaleDateString()}`
                            : t.noExpiry}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(link.inviteUrl, link.code)}
                        disabled={!link.isActive}
                      >
                        {copiedCode === link.code ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            {t.copied}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            {t.copyLink}
                          </>
                        )}
                      </Button>
                      {link.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deactivateInviteLink(link.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Friends;
