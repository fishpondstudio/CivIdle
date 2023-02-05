// This file is generated
import koffi from "koffi";
import path from "path";

let lib;
if (process.platform === "win32") {
   lib = koffi.load(path.join(__dirname, "../steamworks/steam_api64.dll"));
} else if (process.platform === "linux") {
   lib = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.so"));
} else if (process.platform === "darwin") {
   lib = koffi.load(path.join(__dirname, "../steamworks/libsteam_api.dylib"));
} else {
   throw new Error("Unsupported platform: " + process.platform);
}
export const SteamLib = lib;
export type KoffiFunc<T extends (...args: any) => any> = T & {
   async: (...args: [...Parameters<T>, (err: any, result: ReturnType<T>) => void]) => void;
};

export enum ESteamIPType {
   k_ESteamIPTypeIPv4 = 0,
   k_ESteamIPTypeIPv6 = 1,
}
export enum EUniverse {
   k_EUniverseInvalid = 0,
   k_EUniversePublic = 1,
   k_EUniverseBeta = 2,
   k_EUniverseInternal = 3,
   k_EUniverseDev = 4,
   k_EUniverseMax = 5,
}
export enum EResult {
   k_EResultNone = 0,
   k_EResultOK = 1,
   k_EResultFail = 2,
   k_EResultNoConnection = 3,
   k_EResultInvalidPassword = 5,
   k_EResultLoggedInElsewhere = 6,
   k_EResultInvalidProtocolVer = 7,
   k_EResultInvalidParam = 8,
   k_EResultFileNotFound = 9,
   k_EResultBusy = 10,
   k_EResultInvalidState = 11,
   k_EResultInvalidName = 12,
   k_EResultInvalidEmail = 13,
   k_EResultDuplicateName = 14,
   k_EResultAccessDenied = 15,
   k_EResultTimeout = 16,
   k_EResultBanned = 17,
   k_EResultAccountNotFound = 18,
   k_EResultInvalidSteamID = 19,
   k_EResultServiceUnavailable = 20,
   k_EResultNotLoggedOn = 21,
   k_EResultPending = 22,
   k_EResultEncryptionFailure = 23,
   k_EResultInsufficientPrivilege = 24,
   k_EResultLimitExceeded = 25,
   k_EResultRevoked = 26,
   k_EResultExpired = 27,
   k_EResultAlreadyRedeemed = 28,
   k_EResultDuplicateRequest = 29,
   k_EResultAlreadyOwned = 30,
   k_EResultIPNotFound = 31,
   k_EResultPersistFailed = 32,
   k_EResultLockingFailed = 33,
   k_EResultLogonSessionReplaced = 34,
   k_EResultConnectFailed = 35,
   k_EResultHandshakeFailed = 36,
   k_EResultIOFailure = 37,
   k_EResultRemoteDisconnect = 38,
   k_EResultShoppingCartNotFound = 39,
   k_EResultBlocked = 40,
   k_EResultIgnored = 41,
   k_EResultNoMatch = 42,
   k_EResultAccountDisabled = 43,
   k_EResultServiceReadOnly = 44,
   k_EResultAccountNotFeatured = 45,
   k_EResultAdministratorOK = 46,
   k_EResultContentVersion = 47,
   k_EResultTryAnotherCM = 48,
   k_EResultPasswordRequiredToKickSession = 49,
   k_EResultAlreadyLoggedInElsewhere = 50,
   k_EResultSuspended = 51,
   k_EResultCancelled = 52,
   k_EResultDataCorruption = 53,
   k_EResultDiskFull = 54,
   k_EResultRemoteCallFailed = 55,
   k_EResultPasswordUnset = 56,
   k_EResultExternalAccountUnlinked = 57,
   k_EResultPSNTicketInvalid = 58,
   k_EResultExternalAccountAlreadyLinked = 59,
   k_EResultRemoteFileConflict = 60,
   k_EResultIllegalPassword = 61,
   k_EResultSameAsPreviousValue = 62,
   k_EResultAccountLogonDenied = 63,
   k_EResultCannotUseOldPassword = 64,
   k_EResultInvalidLoginAuthCode = 65,
   k_EResultAccountLogonDeniedNoMail = 66,
   k_EResultHardwareNotCapableOfIPT = 67,
   k_EResultIPTInitError = 68,
   k_EResultParentalControlRestricted = 69,
   k_EResultFacebookQueryError = 70,
   k_EResultExpiredLoginAuthCode = 71,
   k_EResultIPLoginRestrictionFailed = 72,
   k_EResultAccountLockedDown = 73,
   k_EResultAccountLogonDeniedVerifiedEmailRequired = 74,
   k_EResultNoMatchingURL = 75,
   k_EResultBadResponse = 76,
   k_EResultRequirePasswordReEntry = 77,
   k_EResultValueOutOfRange = 78,
   k_EResultUnexpectedError = 79,
   k_EResultDisabled = 80,
   k_EResultInvalidCEGSubmission = 81,
   k_EResultRestrictedDevice = 82,
   k_EResultRegionLocked = 83,
   k_EResultRateLimitExceeded = 84,
   k_EResultAccountLoginDeniedNeedTwoFactor = 85,
   k_EResultItemDeleted = 86,
   k_EResultAccountLoginDeniedThrottle = 87,
   k_EResultTwoFactorCodeMismatch = 88,
   k_EResultTwoFactorActivationCodeMismatch = 89,
   k_EResultAccountAssociatedToMultiplePartners = 90,
   k_EResultNotModified = 91,
   k_EResultNoMobileDevice = 92,
   k_EResultTimeNotSynced = 93,
   k_EResultSmsCodeFailed = 94,
   k_EResultAccountLimitExceeded = 95,
   k_EResultAccountActivityLimitExceeded = 96,
   k_EResultPhoneActivityLimitExceeded = 97,
   k_EResultRefundToWallet = 98,
   k_EResultEmailSendFailure = 99,
   k_EResultNotSettled = 100,
   k_EResultNeedCaptcha = 101,
   k_EResultGSLTDenied = 102,
   k_EResultGSOwnerDenied = 103,
   k_EResultInvalidItemType = 104,
   k_EResultIPBanned = 105,
   k_EResultGSLTExpired = 106,
   k_EResultInsufficientFunds = 107,
   k_EResultTooManyPending = 108,
   k_EResultNoSiteLicensesFound = 109,
   k_EResultWGNetworkSendExceeded = 110,
   k_EResultAccountNotFriends = 111,
   k_EResultLimitedUserAccount = 112,
   k_EResultCantRemoveItem = 113,
   k_EResultAccountDeleted = 114,
   k_EResultExistingUserCancelledLicense = 115,
   k_EResultCommunityCooldown = 116,
   k_EResultNoLauncherSpecified = 117,
   k_EResultMustAgreeToSSA = 118,
   k_EResultLauncherMigrated = 119,
   k_EResultSteamRealmMismatch = 120,
   k_EResultInvalidSignature = 121,
   k_EResultParseFailure = 122,
   k_EResultNoVerifiedPhone = 123,
}
export enum EVoiceResult {
   k_EVoiceResultOK = 0,
   k_EVoiceResultNotInitialized = 1,
   k_EVoiceResultNotRecording = 2,
   k_EVoiceResultNoData = 3,
   k_EVoiceResultBufferTooSmall = 4,
   k_EVoiceResultDataCorrupted = 5,
   k_EVoiceResultRestricted = 6,
   k_EVoiceResultUnsupportedCodec = 7,
   k_EVoiceResultReceiverOutOfDate = 8,
   k_EVoiceResultReceiverDidNotAnswer = 9,
}
export enum EDenyReason {
   k_EDenyInvalid = 0,
   k_EDenyInvalidVersion = 1,
   k_EDenyGeneric = 2,
   k_EDenyNotLoggedOn = 3,
   k_EDenyNoLicense = 4,
   k_EDenyCheater = 5,
   k_EDenyLoggedInElseWhere = 6,
   k_EDenyUnknownText = 7,
   k_EDenyIncompatibleAnticheat = 8,
   k_EDenyMemoryCorruption = 9,
   k_EDenyIncompatibleSoftware = 10,
   k_EDenySteamConnectionLost = 11,
   k_EDenySteamConnectionError = 12,
   k_EDenySteamResponseTimedOut = 13,
   k_EDenySteamValidationStalled = 14,
   k_EDenySteamOwnerLeftGuestUser = 15,
}
export enum EBeginAuthSessionResult {
   k_EBeginAuthSessionResultOK = 0,
   k_EBeginAuthSessionResultInvalidTicket = 1,
   k_EBeginAuthSessionResultDuplicateRequest = 2,
   k_EBeginAuthSessionResultInvalidVersion = 3,
   k_EBeginAuthSessionResultGameMismatch = 4,
   k_EBeginAuthSessionResultExpiredTicket = 5,
}
export enum EAuthSessionResponse {
   k_EAuthSessionResponseOK = 0,
   k_EAuthSessionResponseUserNotConnectedToSteam = 1,
   k_EAuthSessionResponseNoLicenseOrExpired = 2,
   k_EAuthSessionResponseVACBanned = 3,
   k_EAuthSessionResponseLoggedInElseWhere = 4,
   k_EAuthSessionResponseVACCheckTimedOut = 5,
   k_EAuthSessionResponseAuthTicketCanceled = 6,
   k_EAuthSessionResponseAuthTicketInvalidAlreadyUsed = 7,
   k_EAuthSessionResponseAuthTicketInvalid = 8,
   k_EAuthSessionResponsePublisherIssuedBan = 9,
}
export enum EUserHasLicenseForAppResult {
   k_EUserHasLicenseResultHasLicense = 0,
   k_EUserHasLicenseResultDoesNotHaveLicense = 1,
   k_EUserHasLicenseResultNoAuth = 2,
}
export enum EAccountType {
   k_EAccountTypeInvalid = 0,
   k_EAccountTypeIndividual = 1,
   k_EAccountTypeMultiseat = 2,
   k_EAccountTypeGameServer = 3,
   k_EAccountTypeAnonGameServer = 4,
   k_EAccountTypePending = 5,
   k_EAccountTypeContentServer = 6,
   k_EAccountTypeClan = 7,
   k_EAccountTypeChat = 8,
   k_EAccountTypeConsoleUser = 9,
   k_EAccountTypeAnonUser = 10,
   k_EAccountTypeMax = 11,
}
export enum EChatEntryType {
   k_EChatEntryTypeInvalid = 0,
   k_EChatEntryTypeChatMsg = 1,
   k_EChatEntryTypeTyping = 2,
   k_EChatEntryTypeInviteGame = 3,
   k_EChatEntryTypeEmote = 4,
   k_EChatEntryTypeLeftConversation = 6,
   k_EChatEntryTypeEntered = 7,
   k_EChatEntryTypeWasKicked = 8,
   k_EChatEntryTypeWasBanned = 9,
   k_EChatEntryTypeDisconnected = 10,
   k_EChatEntryTypeHistoricalChat = 11,
   k_EChatEntryTypeLinkBlocked = 14,
}
export enum EChatRoomEnterResponse {
   k_EChatRoomEnterResponseSuccess = 1,
   k_EChatRoomEnterResponseDoesntExist = 2,
   k_EChatRoomEnterResponseNotAllowed = 3,
   k_EChatRoomEnterResponseFull = 4,
   k_EChatRoomEnterResponseError = 5,
   k_EChatRoomEnterResponseBanned = 6,
   k_EChatRoomEnterResponseLimited = 7,
   k_EChatRoomEnterResponseClanDisabled = 8,
   k_EChatRoomEnterResponseCommunityBan = 9,
   k_EChatRoomEnterResponseMemberBlockedYou = 10,
   k_EChatRoomEnterResponseYouBlockedMember = 11,
   k_EChatRoomEnterResponseRatelimitExceeded = 15,
}
export enum EChatSteamIDInstanceFlags {
   k_EChatAccountInstanceMask = 4095,
   k_EChatInstanceFlagClan = 524288,
   k_EChatInstanceFlagLobby = 262144,
   k_EChatInstanceFlagMMSLobby = 131072,
}
export enum ENotificationPosition {
   k_EPositionTopLeft = 0,
   k_EPositionTopRight = 1,
   k_EPositionBottomLeft = 2,
   k_EPositionBottomRight = 3,
}
export enum EBroadcastUploadResult {
   k_EBroadcastUploadResultNone = 0,
   k_EBroadcastUploadResultOK = 1,
   k_EBroadcastUploadResultInitFailed = 2,
   k_EBroadcastUploadResultFrameFailed = 3,
   k_EBroadcastUploadResultTimeout = 4,
   k_EBroadcastUploadResultBandwidthExceeded = 5,
   k_EBroadcastUploadResultLowFPS = 6,
   k_EBroadcastUploadResultMissingKeyFrames = 7,
   k_EBroadcastUploadResultNoConnection = 8,
   k_EBroadcastUploadResultRelayFailed = 9,
   k_EBroadcastUploadResultSettingsChanged = 10,
   k_EBroadcastUploadResultMissingAudio = 11,
   k_EBroadcastUploadResultTooFarBehind = 12,
   k_EBroadcastUploadResultTranscodeBehind = 13,
   k_EBroadcastUploadResultNotAllowedToPlay = 14,
   k_EBroadcastUploadResultBusy = 15,
   k_EBroadcastUploadResultBanned = 16,
   k_EBroadcastUploadResultAlreadyActive = 17,
   k_EBroadcastUploadResultForcedOff = 18,
   k_EBroadcastUploadResultAudioBehind = 19,
   k_EBroadcastUploadResultShutdown = 20,
   k_EBroadcastUploadResultDisconnect = 21,
   k_EBroadcastUploadResultVideoInitFailed = 22,
   k_EBroadcastUploadResultAudioInitFailed = 23,
}
export enum EMarketNotAllowedReasonFlags {
   k_EMarketNotAllowedReason_None = 0,
   k_EMarketNotAllowedReason_TemporaryFailure = 1,
   k_EMarketNotAllowedReason_AccountDisabled = 2,
   k_EMarketNotAllowedReason_AccountLockedDown = 4,
   k_EMarketNotAllowedReason_AccountLimited = 8,
   k_EMarketNotAllowedReason_TradeBanned = 16,
   k_EMarketNotAllowedReason_AccountNotTrusted = 32,
   k_EMarketNotAllowedReason_SteamGuardNotEnabled = 64,
   k_EMarketNotAllowedReason_SteamGuardOnlyRecentlyEnabled = 128,
   k_EMarketNotAllowedReason_RecentPasswordReset = 256,
   k_EMarketNotAllowedReason_NewPaymentMethod = 512,
   k_EMarketNotAllowedReason_InvalidCookie = 1024,
   k_EMarketNotAllowedReason_UsingNewDevice = 2048,
   k_EMarketNotAllowedReason_RecentSelfRefund = 4096,
   k_EMarketNotAllowedReason_NewPaymentMethodCannotBeVerified = 8192,
   k_EMarketNotAllowedReason_NoRecentPurchases = 16384,
   k_EMarketNotAllowedReason_AcceptedWalletGift = 32768,
}
export enum EDurationControlProgress {
   k_EDurationControlProgress_Full = 0,
   k_EDurationControlProgress_Half = 1,
   k_EDurationControlProgress_None = 2,
   k_EDurationControl_ExitSoon_3h = 3,
   k_EDurationControl_ExitSoon_5h = 4,
   k_EDurationControl_ExitSoon_Night = 5,
}
export enum EDurationControlNotification {
   k_EDurationControlNotification_None = 0,
   k_EDurationControlNotification_1Hour = 1,
   k_EDurationControlNotification_3Hours = 2,
   k_EDurationControlNotification_HalfProgress = 3,
   k_EDurationControlNotification_NoProgress = 4,
   k_EDurationControlNotification_ExitSoon_3h = 5,
   k_EDurationControlNotification_ExitSoon_5h = 6,
   k_EDurationControlNotification_ExitSoon_Night = 7,
}
export enum EDurationControlOnlineState {
   k_EDurationControlOnlineState_Invalid = 0,
   k_EDurationControlOnlineState_Offline = 1,
   k_EDurationControlOnlineState_Online = 2,
   k_EDurationControlOnlineState_OnlineHighPri = 3,
}
export enum EGameSearchErrorCode_t {
   k_EGameSearchErrorCode_OK = 1,
   k_EGameSearchErrorCode_Failed_Search_Already_In_Progress = 2,
   k_EGameSearchErrorCode_Failed_No_Search_In_Progress = 3,
   k_EGameSearchErrorCode_Failed_Not_Lobby_Leader = 4,
   k_EGameSearchErrorCode_Failed_No_Host_Available = 5,
   k_EGameSearchErrorCode_Failed_Search_Params_Invalid = 6,
   k_EGameSearchErrorCode_Failed_Offline = 7,
   k_EGameSearchErrorCode_Failed_NotAuthorized = 8,
   k_EGameSearchErrorCode_Failed_Unknown_Error = 9,
}
export enum EPlayerResult_t {
   k_EPlayerResultFailedToConnect = 1,
   k_EPlayerResultAbandoned = 2,
   k_EPlayerResultKicked = 3,
   k_EPlayerResultIncomplete = 4,
   k_EPlayerResultCompleted = 5,
}
export enum ESteamIPv6ConnectivityProtocol {
   k_ESteamIPv6ConnectivityProtocol_Invalid = 0,
   k_ESteamIPv6ConnectivityProtocol_HTTP = 1,
   k_ESteamIPv6ConnectivityProtocol_UDP = 2,
}
export enum ESteamIPv6ConnectivityState {
   k_ESteamIPv6ConnectivityState_Unknown = 0,
   k_ESteamIPv6ConnectivityState_Good = 1,
   k_ESteamIPv6ConnectivityState_Bad = 2,
}
export enum EFriendRelationship {
   k_EFriendRelationshipNone = 0,
   k_EFriendRelationshipBlocked = 1,
   k_EFriendRelationshipRequestRecipient = 2,
   k_EFriendRelationshipFriend = 3,
   k_EFriendRelationshipRequestInitiator = 4,
   k_EFriendRelationshipIgnored = 5,
   k_EFriendRelationshipIgnoredFriend = 6,
   k_EFriendRelationshipSuggested_DEPRECATED = 7,
   k_EFriendRelationshipMax = 8,
}
export enum EPersonaState {
   k_EPersonaStateOffline = 0,
   k_EPersonaStateOnline = 1,
   k_EPersonaStateBusy = 2,
   k_EPersonaStateAway = 3,
   k_EPersonaStateSnooze = 4,
   k_EPersonaStateLookingToTrade = 5,
   k_EPersonaStateLookingToPlay = 6,
   k_EPersonaStateInvisible = 7,
   k_EPersonaStateMax = 8,
}
export enum EFriendFlags {
   k_EFriendFlagNone = 0,
   k_EFriendFlagBlocked = 1,
   k_EFriendFlagFriendshipRequested = 2,
   k_EFriendFlagImmediate = 4,
   k_EFriendFlagClanMember = 8,
   k_EFriendFlagOnGameServer = 16,
   k_EFriendFlagRequestingFriendship = 128,
   k_EFriendFlagRequestingInfo = 256,
   k_EFriendFlagIgnored = 512,
   k_EFriendFlagIgnoredFriend = 1024,
   k_EFriendFlagChatMember = 4096,
   k_EFriendFlagAll = 65535,
}
export enum EUserRestriction {
   k_nUserRestrictionNone = 0,
   k_nUserRestrictionUnknown = 1,
   k_nUserRestrictionAnyChat = 2,
   k_nUserRestrictionVoiceChat = 4,
   k_nUserRestrictionGroupChat = 8,
   k_nUserRestrictionRating = 16,
   k_nUserRestrictionGameInvites = 32,
   k_nUserRestrictionTrading = 64,
}
export enum EOverlayToStoreFlag {
   k_EOverlayToStoreFlag_None = 0,
   k_EOverlayToStoreFlag_AddToCart = 1,
   k_EOverlayToStoreFlag_AddToCartAndShow = 2,
}
export enum EActivateGameOverlayToWebPageMode {
   k_EActivateGameOverlayToWebPageMode_Default = 0,
   k_EActivateGameOverlayToWebPageMode_Modal = 1,
}
export enum EPersonaChange {
   k_EPersonaChangeName = 1,
   k_EPersonaChangeStatus = 2,
   k_EPersonaChangeComeOnline = 4,
   k_EPersonaChangeGoneOffline = 8,
   k_EPersonaChangeGamePlayed = 16,
   k_EPersonaChangeGameServer = 32,
   k_EPersonaChangeAvatar = 64,
   k_EPersonaChangeJoinedSource = 128,
   k_EPersonaChangeLeftSource = 256,
   k_EPersonaChangeRelationshipChanged = 512,
   k_EPersonaChangeNameFirstSet = 1024,
   k_EPersonaChangeBroadcast = 2048,
   k_EPersonaChangeNickname = 4096,
   k_EPersonaChangeSteamLevel = 8192,
   k_EPersonaChangeRichPresence = 16384,
}
export enum ESteamAPICallFailure {
   k_ESteamAPICallFailureNone = -1,
   k_ESteamAPICallFailureSteamGone = 0,
   k_ESteamAPICallFailureNetworkFailure = 1,
   k_ESteamAPICallFailureInvalidHandle = 2,
   k_ESteamAPICallFailureMismatchedCallback = 3,
}
export enum EGamepadTextInputMode {
   k_EGamepadTextInputModeNormal = 0,
   k_EGamepadTextInputModePassword = 1,
}
export enum EGamepadTextInputLineMode {
   k_EGamepadTextInputLineModeSingleLine = 0,
   k_EGamepadTextInputLineModeMultipleLines = 1,
}
export enum EFloatingGamepadTextInputMode {
   k_EFloatingGamepadTextInputModeModeSingleLine = 0,
   k_EFloatingGamepadTextInputModeModeMultipleLines = 1,
   k_EFloatingGamepadTextInputModeModeEmail = 2,
   k_EFloatingGamepadTextInputModeModeNumeric = 3,
}
export enum ETextFilteringContext {
   k_ETextFilteringContextUnknown = 0,
   k_ETextFilteringContextGameContent = 1,
   k_ETextFilteringContextChat = 2,
   k_ETextFilteringContextName = 3,
}
export enum ECheckFileSignature {
   k_ECheckFileSignatureInvalidSignature = 0,
   k_ECheckFileSignatureValidSignature = 1,
   k_ECheckFileSignatureFileNotFound = 2,
   k_ECheckFileSignatureNoSignaturesFoundForThisApp = 3,
   k_ECheckFileSignatureNoSignaturesFoundForThisFile = 4,
}
export enum EMatchMakingServerResponse {
   eServerResponded = 0,
   eServerFailedToRespond = 1,
   eNoServersListedOnMasterServer = 2,
}
export enum ELobbyType {
   k_ELobbyTypePrivate = 0,
   k_ELobbyTypeFriendsOnly = 1,
   k_ELobbyTypePublic = 2,
   k_ELobbyTypeInvisible = 3,
   k_ELobbyTypePrivateUnique = 4,
}
export enum ELobbyComparison {
   k_ELobbyComparisonEqualToOrLessThan = -2,
   k_ELobbyComparisonLessThan = -1,
   k_ELobbyComparisonEqual = 0,
   k_ELobbyComparisonGreaterThan = 1,
   k_ELobbyComparisonEqualToOrGreaterThan = 2,
   k_ELobbyComparisonNotEqual = 3,
}
export enum ELobbyDistanceFilter {
   k_ELobbyDistanceFilterClose = 0,
   k_ELobbyDistanceFilterDefault = 1,
   k_ELobbyDistanceFilterFar = 2,
   k_ELobbyDistanceFilterWorldwide = 3,
}
export enum EChatMemberStateChange {
   k_EChatMemberStateChangeEntered = 1,
   k_EChatMemberStateChangeLeft = 2,
   k_EChatMemberStateChangeDisconnected = 4,
   k_EChatMemberStateChangeKicked = 8,
   k_EChatMemberStateChangeBanned = 16,
}
export enum ESteamPartyBeaconLocationType {
   k_ESteamPartyBeaconLocationType_Invalid = 0,
   k_ESteamPartyBeaconLocationType_ChatGroup = 1,
   k_ESteamPartyBeaconLocationType_Max = 2,
}
export enum ESteamPartyBeaconLocationData {
   k_ESteamPartyBeaconLocationDataInvalid = 0,
   k_ESteamPartyBeaconLocationDataName = 1,
   k_ESteamPartyBeaconLocationDataIconURLSmall = 2,
   k_ESteamPartyBeaconLocationDataIconURLMedium = 3,
   k_ESteamPartyBeaconLocationDataIconURLLarge = 4,
}
export enum ERemoteStoragePlatform {
   k_ERemoteStoragePlatformNone = 0,
   k_ERemoteStoragePlatformWindows = 1,
   k_ERemoteStoragePlatformOSX = 2,
   k_ERemoteStoragePlatformPS3 = 4,
   k_ERemoteStoragePlatformLinux = 8,
   k_ERemoteStoragePlatformSwitch = 16,
   k_ERemoteStoragePlatformAndroid = 32,
   k_ERemoteStoragePlatformIOS = 64,
   k_ERemoteStoragePlatformAll = -1,
}
export enum ERemoteStoragePublishedFileVisibility {
   k_ERemoteStoragePublishedFileVisibilityPublic = 0,
   k_ERemoteStoragePublishedFileVisibilityFriendsOnly = 1,
   k_ERemoteStoragePublishedFileVisibilityPrivate = 2,
   k_ERemoteStoragePublishedFileVisibilityUnlisted = 3,
}
export enum EWorkshopFileType {
   k_EWorkshopFileTypeFirst = 0,
   k_EWorkshopFileTypeCommunity = 0,
   k_EWorkshopFileTypeMicrotransaction = 1,
   k_EWorkshopFileTypeCollection = 2,
   k_EWorkshopFileTypeArt = 3,
   k_EWorkshopFileTypeVideo = 4,
   k_EWorkshopFileTypeScreenshot = 5,
   k_EWorkshopFileTypeGame = 6,
   k_EWorkshopFileTypeSoftware = 7,
   k_EWorkshopFileTypeConcept = 8,
   k_EWorkshopFileTypeWebGuide = 9,
   k_EWorkshopFileTypeIntegratedGuide = 10,
   k_EWorkshopFileTypeMerch = 11,
   k_EWorkshopFileTypeControllerBinding = 12,
   k_EWorkshopFileTypeSteamworksAccessInvite = 13,
   k_EWorkshopFileTypeSteamVideo = 14,
   k_EWorkshopFileTypeGameManagedItem = 15,
   k_EWorkshopFileTypeMax = 16,
}
export enum EWorkshopVote {
   k_EWorkshopVoteUnvoted = 0,
   k_EWorkshopVoteFor = 1,
   k_EWorkshopVoteAgainst = 2,
   k_EWorkshopVoteLater = 3,
}
export enum EWorkshopFileAction {
   k_EWorkshopFileActionPlayed = 0,
   k_EWorkshopFileActionCompleted = 1,
}
export enum EWorkshopEnumerationType {
   k_EWorkshopEnumerationTypeRankedByVote = 0,
   k_EWorkshopEnumerationTypeRecent = 1,
   k_EWorkshopEnumerationTypeTrending = 2,
   k_EWorkshopEnumerationTypeFavoritesOfFriends = 3,
   k_EWorkshopEnumerationTypeVotedByFriends = 4,
   k_EWorkshopEnumerationTypeContentByFriends = 5,
   k_EWorkshopEnumerationTypeRecentFromFollowedUsers = 6,
}
export enum EWorkshopVideoProvider {
   k_EWorkshopVideoProviderNone = 0,
   k_EWorkshopVideoProviderYoutube = 1,
}
export enum EUGCReadAction {
   k_EUGCRead_ContinueReadingUntilFinished = 0,
   k_EUGCRead_ContinueReading = 1,
   k_EUGCRead_Close = 2,
}
export enum ERemoteStorageLocalFileChange {
   k_ERemoteStorageLocalFileChange_Invalid = 0,
   k_ERemoteStorageLocalFileChange_FileUpdated = 1,
   k_ERemoteStorageLocalFileChange_FileDeleted = 2,
}
export enum ERemoteStorageFilePathType {
   k_ERemoteStorageFilePathType_Invalid = 0,
   k_ERemoteStorageFilePathType_Absolute = 1,
   k_ERemoteStorageFilePathType_APIFilename = 2,
}
export enum ELeaderboardDataRequest {
   k_ELeaderboardDataRequestGlobal = 0,
   k_ELeaderboardDataRequestGlobalAroundUser = 1,
   k_ELeaderboardDataRequestFriends = 2,
   k_ELeaderboardDataRequestUsers = 3,
}
export enum ELeaderboardSortMethod {
   k_ELeaderboardSortMethodNone = 0,
   k_ELeaderboardSortMethodAscending = 1,
   k_ELeaderboardSortMethodDescending = 2,
}
export enum ELeaderboardDisplayType {
   k_ELeaderboardDisplayTypeNone = 0,
   k_ELeaderboardDisplayTypeNumeric = 1,
   k_ELeaderboardDisplayTypeTimeSeconds = 2,
   k_ELeaderboardDisplayTypeTimeMilliSeconds = 3,
}
export enum ELeaderboardUploadScoreMethod {
   k_ELeaderboardUploadScoreMethodNone = 0,
   k_ELeaderboardUploadScoreMethodKeepBest = 1,
   k_ELeaderboardUploadScoreMethodForceUpdate = 2,
}
export enum ERegisterActivationCodeResult {
   k_ERegisterActivationCodeResultOK = 0,
   k_ERegisterActivationCodeResultFail = 1,
   k_ERegisterActivationCodeResultAlreadyRegistered = 2,
   k_ERegisterActivationCodeResultTimeout = 3,
   k_ERegisterActivationCodeAlreadyOwned = 4,
}
export enum EP2PSessionError {
   k_EP2PSessionErrorNone = 0,
   k_EP2PSessionErrorNoRightsToApp = 2,
   k_EP2PSessionErrorTimeout = 4,
   k_EP2PSessionErrorNotRunningApp_DELETED = 1,
   k_EP2PSessionErrorDestinationNotLoggedIn_DELETED = 3,
   k_EP2PSessionErrorMax = 5,
}
export enum EP2PSend {
   k_EP2PSendUnreliable = 0,
   k_EP2PSendUnreliableNoDelay = 1,
   k_EP2PSendReliable = 2,
   k_EP2PSendReliableWithBuffering = 3,
}
export enum ESNetSocketState {
   k_ESNetSocketStateInvalid = 0,
   k_ESNetSocketStateConnected = 1,
   k_ESNetSocketStateInitiated = 10,
   k_ESNetSocketStateLocalCandidatesFound = 11,
   k_ESNetSocketStateReceivedRemoteCandidates = 12,
   k_ESNetSocketStateChallengeHandshake = 15,
   k_ESNetSocketStateDisconnecting = 21,
   k_ESNetSocketStateLocalDisconnect = 22,
   k_ESNetSocketStateTimeoutDuringConnect = 23,
   k_ESNetSocketStateRemoteEndDisconnected = 24,
   k_ESNetSocketStateConnectionBroken = 25,
}
export enum ESNetSocketConnectionType {
   k_ESNetSocketConnectionTypeNotConnected = 0,
   k_ESNetSocketConnectionTypeUDP = 1,
   k_ESNetSocketConnectionTypeUDPRelay = 2,
}
export enum EVRScreenshotType {
   k_EVRScreenshotType_None = 0,
   k_EVRScreenshotType_Mono = 1,
   k_EVRScreenshotType_Stereo = 2,
   k_EVRScreenshotType_MonoCubemap = 3,
   k_EVRScreenshotType_MonoPanorama = 4,
   k_EVRScreenshotType_StereoPanorama = 5,
}
export enum AudioPlayback_Status {
   AudioPlayback_Undefined = 0,
   AudioPlayback_Playing = 1,
   AudioPlayback_Paused = 2,
   AudioPlayback_Idle = 3,
}
export enum EHTTPMethod {
   k_EHTTPMethodInvalid = 0,
   k_EHTTPMethodGET = 1,
   k_EHTTPMethodHEAD = 2,
   k_EHTTPMethodPOST = 3,
   k_EHTTPMethodPUT = 4,
   k_EHTTPMethodDELETE = 5,
   k_EHTTPMethodOPTIONS = 6,
   k_EHTTPMethodPATCH = 7,
}
export enum EHTTPStatusCode {
   k_EHTTPStatusCodeInvalid = 0,
   k_EHTTPStatusCode100Continue = 100,
   k_EHTTPStatusCode101SwitchingProtocols = 101,
   k_EHTTPStatusCode200OK = 200,
   k_EHTTPStatusCode201Created = 201,
   k_EHTTPStatusCode202Accepted = 202,
   k_EHTTPStatusCode203NonAuthoritative = 203,
   k_EHTTPStatusCode204NoContent = 204,
   k_EHTTPStatusCode205ResetContent = 205,
   k_EHTTPStatusCode206PartialContent = 206,
   k_EHTTPStatusCode300MultipleChoices = 300,
   k_EHTTPStatusCode301MovedPermanently = 301,
   k_EHTTPStatusCode302Found = 302,
   k_EHTTPStatusCode303SeeOther = 303,
   k_EHTTPStatusCode304NotModified = 304,
   k_EHTTPStatusCode305UseProxy = 305,
   k_EHTTPStatusCode307TemporaryRedirect = 307,
   k_EHTTPStatusCode400BadRequest = 400,
   k_EHTTPStatusCode401Unauthorized = 401,
   k_EHTTPStatusCode402PaymentRequired = 402,
   k_EHTTPStatusCode403Forbidden = 403,
   k_EHTTPStatusCode404NotFound = 404,
   k_EHTTPStatusCode405MethodNotAllowed = 405,
   k_EHTTPStatusCode406NotAcceptable = 406,
   k_EHTTPStatusCode407ProxyAuthRequired = 407,
   k_EHTTPStatusCode408RequestTimeout = 408,
   k_EHTTPStatusCode409Conflict = 409,
   k_EHTTPStatusCode410Gone = 410,
   k_EHTTPStatusCode411LengthRequired = 411,
   k_EHTTPStatusCode412PreconditionFailed = 412,
   k_EHTTPStatusCode413RequestEntityTooLarge = 413,
   k_EHTTPStatusCode414RequestURITooLong = 414,
   k_EHTTPStatusCode415UnsupportedMediaType = 415,
   k_EHTTPStatusCode416RequestedRangeNotSatisfiable = 416,
   k_EHTTPStatusCode417ExpectationFailed = 417,
   k_EHTTPStatusCode4xxUnknown = 418,
   k_EHTTPStatusCode429TooManyRequests = 429,
   k_EHTTPStatusCode444ConnectionClosed = 444,
   k_EHTTPStatusCode500InternalServerError = 500,
   k_EHTTPStatusCode501NotImplemented = 501,
   k_EHTTPStatusCode502BadGateway = 502,
   k_EHTTPStatusCode503ServiceUnavailable = 503,
   k_EHTTPStatusCode504GatewayTimeout = 504,
   k_EHTTPStatusCode505HTTPVersionNotSupported = 505,
   k_EHTTPStatusCode5xxUnknown = 599,
}
export enum EInputSourceMode {
   k_EInputSourceMode_None = 0,
   k_EInputSourceMode_Dpad = 1,
   k_EInputSourceMode_Buttons = 2,
   k_EInputSourceMode_FourButtons = 3,
   k_EInputSourceMode_AbsoluteMouse = 4,
   k_EInputSourceMode_RelativeMouse = 5,
   k_EInputSourceMode_JoystickMove = 6,
   k_EInputSourceMode_JoystickMouse = 7,
   k_EInputSourceMode_JoystickCamera = 8,
   k_EInputSourceMode_ScrollWheel = 9,
   k_EInputSourceMode_Trigger = 10,
   k_EInputSourceMode_TouchMenu = 11,
   k_EInputSourceMode_MouseJoystick = 12,
   k_EInputSourceMode_MouseRegion = 13,
   k_EInputSourceMode_RadialMenu = 14,
   k_EInputSourceMode_SingleButton = 15,
   k_EInputSourceMode_Switches = 16,
}
export enum EInputActionOrigin {
   k_EInputActionOrigin_None = 0,
   k_EInputActionOrigin_SteamController_A = 1,
   k_EInputActionOrigin_SteamController_B = 2,
   k_EInputActionOrigin_SteamController_X = 3,
   k_EInputActionOrigin_SteamController_Y = 4,
   k_EInputActionOrigin_SteamController_LeftBumper = 5,
   k_EInputActionOrigin_SteamController_RightBumper = 6,
   k_EInputActionOrigin_SteamController_LeftGrip = 7,
   k_EInputActionOrigin_SteamController_RightGrip = 8,
   k_EInputActionOrigin_SteamController_Start = 9,
   k_EInputActionOrigin_SteamController_Back = 10,
   k_EInputActionOrigin_SteamController_LeftPad_Touch = 11,
   k_EInputActionOrigin_SteamController_LeftPad_Swipe = 12,
   k_EInputActionOrigin_SteamController_LeftPad_Click = 13,
   k_EInputActionOrigin_SteamController_LeftPad_DPadNorth = 14,
   k_EInputActionOrigin_SteamController_LeftPad_DPadSouth = 15,
   k_EInputActionOrigin_SteamController_LeftPad_DPadWest = 16,
   k_EInputActionOrigin_SteamController_LeftPad_DPadEast = 17,
   k_EInputActionOrigin_SteamController_RightPad_Touch = 18,
   k_EInputActionOrigin_SteamController_RightPad_Swipe = 19,
   k_EInputActionOrigin_SteamController_RightPad_Click = 20,
   k_EInputActionOrigin_SteamController_RightPad_DPadNorth = 21,
   k_EInputActionOrigin_SteamController_RightPad_DPadSouth = 22,
   k_EInputActionOrigin_SteamController_RightPad_DPadWest = 23,
   k_EInputActionOrigin_SteamController_RightPad_DPadEast = 24,
   k_EInputActionOrigin_SteamController_LeftTrigger_Pull = 25,
   k_EInputActionOrigin_SteamController_LeftTrigger_Click = 26,
   k_EInputActionOrigin_SteamController_RightTrigger_Pull = 27,
   k_EInputActionOrigin_SteamController_RightTrigger_Click = 28,
   k_EInputActionOrigin_SteamController_LeftStick_Move = 29,
   k_EInputActionOrigin_SteamController_LeftStick_Click = 30,
   k_EInputActionOrigin_SteamController_LeftStick_DPadNorth = 31,
   k_EInputActionOrigin_SteamController_LeftStick_DPadSouth = 32,
   k_EInputActionOrigin_SteamController_LeftStick_DPadWest = 33,
   k_EInputActionOrigin_SteamController_LeftStick_DPadEast = 34,
   k_EInputActionOrigin_SteamController_Gyro_Move = 35,
   k_EInputActionOrigin_SteamController_Gyro_Pitch = 36,
   k_EInputActionOrigin_SteamController_Gyro_Yaw = 37,
   k_EInputActionOrigin_SteamController_Gyro_Roll = 38,
   k_EInputActionOrigin_SteamController_Reserved0 = 39,
   k_EInputActionOrigin_SteamController_Reserved1 = 40,
   k_EInputActionOrigin_SteamController_Reserved2 = 41,
   k_EInputActionOrigin_SteamController_Reserved3 = 42,
   k_EInputActionOrigin_SteamController_Reserved4 = 43,
   k_EInputActionOrigin_SteamController_Reserved5 = 44,
   k_EInputActionOrigin_SteamController_Reserved6 = 45,
   k_EInputActionOrigin_SteamController_Reserved7 = 46,
   k_EInputActionOrigin_SteamController_Reserved8 = 47,
   k_EInputActionOrigin_SteamController_Reserved9 = 48,
   k_EInputActionOrigin_SteamController_Reserved10 = 49,
   k_EInputActionOrigin_PS4_X = 50,
   k_EInputActionOrigin_PS4_Circle = 51,
   k_EInputActionOrigin_PS4_Triangle = 52,
   k_EInputActionOrigin_PS4_Square = 53,
   k_EInputActionOrigin_PS4_LeftBumper = 54,
   k_EInputActionOrigin_PS4_RightBumper = 55,
   k_EInputActionOrigin_PS4_Options = 56,
   k_EInputActionOrigin_PS4_Share = 57,
   k_EInputActionOrigin_PS4_LeftPad_Touch = 58,
   k_EInputActionOrigin_PS4_LeftPad_Swipe = 59,
   k_EInputActionOrigin_PS4_LeftPad_Click = 60,
   k_EInputActionOrigin_PS4_LeftPad_DPadNorth = 61,
   k_EInputActionOrigin_PS4_LeftPad_DPadSouth = 62,
   k_EInputActionOrigin_PS4_LeftPad_DPadWest = 63,
   k_EInputActionOrigin_PS4_LeftPad_DPadEast = 64,
   k_EInputActionOrigin_PS4_RightPad_Touch = 65,
   k_EInputActionOrigin_PS4_RightPad_Swipe = 66,
   k_EInputActionOrigin_PS4_RightPad_Click = 67,
   k_EInputActionOrigin_PS4_RightPad_DPadNorth = 68,
   k_EInputActionOrigin_PS4_RightPad_DPadSouth = 69,
   k_EInputActionOrigin_PS4_RightPad_DPadWest = 70,
   k_EInputActionOrigin_PS4_RightPad_DPadEast = 71,
   k_EInputActionOrigin_PS4_CenterPad_Touch = 72,
   k_EInputActionOrigin_PS4_CenterPad_Swipe = 73,
   k_EInputActionOrigin_PS4_CenterPad_Click = 74,
   k_EInputActionOrigin_PS4_CenterPad_DPadNorth = 75,
   k_EInputActionOrigin_PS4_CenterPad_DPadSouth = 76,
   k_EInputActionOrigin_PS4_CenterPad_DPadWest = 77,
   k_EInputActionOrigin_PS4_CenterPad_DPadEast = 78,
   k_EInputActionOrigin_PS4_LeftTrigger_Pull = 79,
   k_EInputActionOrigin_PS4_LeftTrigger_Click = 80,
   k_EInputActionOrigin_PS4_RightTrigger_Pull = 81,
   k_EInputActionOrigin_PS4_RightTrigger_Click = 82,
   k_EInputActionOrigin_PS4_LeftStick_Move = 83,
   k_EInputActionOrigin_PS4_LeftStick_Click = 84,
   k_EInputActionOrigin_PS4_LeftStick_DPadNorth = 85,
   k_EInputActionOrigin_PS4_LeftStick_DPadSouth = 86,
   k_EInputActionOrigin_PS4_LeftStick_DPadWest = 87,
   k_EInputActionOrigin_PS4_LeftStick_DPadEast = 88,
   k_EInputActionOrigin_PS4_RightStick_Move = 89,
   k_EInputActionOrigin_PS4_RightStick_Click = 90,
   k_EInputActionOrigin_PS4_RightStick_DPadNorth = 91,
   k_EInputActionOrigin_PS4_RightStick_DPadSouth = 92,
   k_EInputActionOrigin_PS4_RightStick_DPadWest = 93,
   k_EInputActionOrigin_PS4_RightStick_DPadEast = 94,
   k_EInputActionOrigin_PS4_DPad_North = 95,
   k_EInputActionOrigin_PS4_DPad_South = 96,
   k_EInputActionOrigin_PS4_DPad_West = 97,
   k_EInputActionOrigin_PS4_DPad_East = 98,
   k_EInputActionOrigin_PS4_Gyro_Move = 99,
   k_EInputActionOrigin_PS4_Gyro_Pitch = 100,
   k_EInputActionOrigin_PS4_Gyro_Yaw = 101,
   k_EInputActionOrigin_PS4_Gyro_Roll = 102,
   k_EInputActionOrigin_PS4_DPad_Move = 103,
   k_EInputActionOrigin_PS4_Reserved1 = 104,
   k_EInputActionOrigin_PS4_Reserved2 = 105,
   k_EInputActionOrigin_PS4_Reserved3 = 106,
   k_EInputActionOrigin_PS4_Reserved4 = 107,
   k_EInputActionOrigin_PS4_Reserved5 = 108,
   k_EInputActionOrigin_PS4_Reserved6 = 109,
   k_EInputActionOrigin_PS4_Reserved7 = 110,
   k_EInputActionOrigin_PS4_Reserved8 = 111,
   k_EInputActionOrigin_PS4_Reserved9 = 112,
   k_EInputActionOrigin_PS4_Reserved10 = 113,
   k_EInputActionOrigin_XBoxOne_A = 114,
   k_EInputActionOrigin_XBoxOne_B = 115,
   k_EInputActionOrigin_XBoxOne_X = 116,
   k_EInputActionOrigin_XBoxOne_Y = 117,
   k_EInputActionOrigin_XBoxOne_LeftBumper = 118,
   k_EInputActionOrigin_XBoxOne_RightBumper = 119,
   k_EInputActionOrigin_XBoxOne_Menu = 120,
   k_EInputActionOrigin_XBoxOne_View = 121,
   k_EInputActionOrigin_XBoxOne_LeftTrigger_Pull = 122,
   k_EInputActionOrigin_XBoxOne_LeftTrigger_Click = 123,
   k_EInputActionOrigin_XBoxOne_RightTrigger_Pull = 124,
   k_EInputActionOrigin_XBoxOne_RightTrigger_Click = 125,
   k_EInputActionOrigin_XBoxOne_LeftStick_Move = 126,
   k_EInputActionOrigin_XBoxOne_LeftStick_Click = 127,
   k_EInputActionOrigin_XBoxOne_LeftStick_DPadNorth = 128,
   k_EInputActionOrigin_XBoxOne_LeftStick_DPadSouth = 129,
   k_EInputActionOrigin_XBoxOne_LeftStick_DPadWest = 130,
   k_EInputActionOrigin_XBoxOne_LeftStick_DPadEast = 131,
   k_EInputActionOrigin_XBoxOne_RightStick_Move = 132,
   k_EInputActionOrigin_XBoxOne_RightStick_Click = 133,
   k_EInputActionOrigin_XBoxOne_RightStick_DPadNorth = 134,
   k_EInputActionOrigin_XBoxOne_RightStick_DPadSouth = 135,
   k_EInputActionOrigin_XBoxOne_RightStick_DPadWest = 136,
   k_EInputActionOrigin_XBoxOne_RightStick_DPadEast = 137,
   k_EInputActionOrigin_XBoxOne_DPad_North = 138,
   k_EInputActionOrigin_XBoxOne_DPad_South = 139,
   k_EInputActionOrigin_XBoxOne_DPad_West = 140,
   k_EInputActionOrigin_XBoxOne_DPad_East = 141,
   k_EInputActionOrigin_XBoxOne_DPad_Move = 142,
   k_EInputActionOrigin_XBoxOne_LeftGrip_Lower = 143,
   k_EInputActionOrigin_XBoxOne_LeftGrip_Upper = 144,
   k_EInputActionOrigin_XBoxOne_RightGrip_Lower = 145,
   k_EInputActionOrigin_XBoxOne_RightGrip_Upper = 146,
   k_EInputActionOrigin_XBoxOne_Share = 147,
   k_EInputActionOrigin_XBoxOne_Reserved6 = 148,
   k_EInputActionOrigin_XBoxOne_Reserved7 = 149,
   k_EInputActionOrigin_XBoxOne_Reserved8 = 150,
   k_EInputActionOrigin_XBoxOne_Reserved9 = 151,
   k_EInputActionOrigin_XBoxOne_Reserved10 = 152,
   k_EInputActionOrigin_XBox360_A = 153,
   k_EInputActionOrigin_XBox360_B = 154,
   k_EInputActionOrigin_XBox360_X = 155,
   k_EInputActionOrigin_XBox360_Y = 156,
   k_EInputActionOrigin_XBox360_LeftBumper = 157,
   k_EInputActionOrigin_XBox360_RightBumper = 158,
   k_EInputActionOrigin_XBox360_Start = 159,
   k_EInputActionOrigin_XBox360_Back = 160,
   k_EInputActionOrigin_XBox360_LeftTrigger_Pull = 161,
   k_EInputActionOrigin_XBox360_LeftTrigger_Click = 162,
   k_EInputActionOrigin_XBox360_RightTrigger_Pull = 163,
   k_EInputActionOrigin_XBox360_RightTrigger_Click = 164,
   k_EInputActionOrigin_XBox360_LeftStick_Move = 165,
   k_EInputActionOrigin_XBox360_LeftStick_Click = 166,
   k_EInputActionOrigin_XBox360_LeftStick_DPadNorth = 167,
   k_EInputActionOrigin_XBox360_LeftStick_DPadSouth = 168,
   k_EInputActionOrigin_XBox360_LeftStick_DPadWest = 169,
   k_EInputActionOrigin_XBox360_LeftStick_DPadEast = 170,
   k_EInputActionOrigin_XBox360_RightStick_Move = 171,
   k_EInputActionOrigin_XBox360_RightStick_Click = 172,
   k_EInputActionOrigin_XBox360_RightStick_DPadNorth = 173,
   k_EInputActionOrigin_XBox360_RightStick_DPadSouth = 174,
   k_EInputActionOrigin_XBox360_RightStick_DPadWest = 175,
   k_EInputActionOrigin_XBox360_RightStick_DPadEast = 176,
   k_EInputActionOrigin_XBox360_DPad_North = 177,
   k_EInputActionOrigin_XBox360_DPad_South = 178,
   k_EInputActionOrigin_XBox360_DPad_West = 179,
   k_EInputActionOrigin_XBox360_DPad_East = 180,
   k_EInputActionOrigin_XBox360_DPad_Move = 181,
   k_EInputActionOrigin_XBox360_Reserved1 = 182,
   k_EInputActionOrigin_XBox360_Reserved2 = 183,
   k_EInputActionOrigin_XBox360_Reserved3 = 184,
   k_EInputActionOrigin_XBox360_Reserved4 = 185,
   k_EInputActionOrigin_XBox360_Reserved5 = 186,
   k_EInputActionOrigin_XBox360_Reserved6 = 187,
   k_EInputActionOrigin_XBox360_Reserved7 = 188,
   k_EInputActionOrigin_XBox360_Reserved8 = 189,
   k_EInputActionOrigin_XBox360_Reserved9 = 190,
   k_EInputActionOrigin_XBox360_Reserved10 = 191,
   k_EInputActionOrigin_Switch_A = 192,
   k_EInputActionOrigin_Switch_B = 193,
   k_EInputActionOrigin_Switch_X = 194,
   k_EInputActionOrigin_Switch_Y = 195,
   k_EInputActionOrigin_Switch_LeftBumper = 196,
   k_EInputActionOrigin_Switch_RightBumper = 197,
   k_EInputActionOrigin_Switch_Plus = 198,
   k_EInputActionOrigin_Switch_Minus = 199,
   k_EInputActionOrigin_Switch_Capture = 200,
   k_EInputActionOrigin_Switch_LeftTrigger_Pull = 201,
   k_EInputActionOrigin_Switch_LeftTrigger_Click = 202,
   k_EInputActionOrigin_Switch_RightTrigger_Pull = 203,
   k_EInputActionOrigin_Switch_RightTrigger_Click = 204,
   k_EInputActionOrigin_Switch_LeftStick_Move = 205,
   k_EInputActionOrigin_Switch_LeftStick_Click = 206,
   k_EInputActionOrigin_Switch_LeftStick_DPadNorth = 207,
   k_EInputActionOrigin_Switch_LeftStick_DPadSouth = 208,
   k_EInputActionOrigin_Switch_LeftStick_DPadWest = 209,
   k_EInputActionOrigin_Switch_LeftStick_DPadEast = 210,
   k_EInputActionOrigin_Switch_RightStick_Move = 211,
   k_EInputActionOrigin_Switch_RightStick_Click = 212,
   k_EInputActionOrigin_Switch_RightStick_DPadNorth = 213,
   k_EInputActionOrigin_Switch_RightStick_DPadSouth = 214,
   k_EInputActionOrigin_Switch_RightStick_DPadWest = 215,
   k_EInputActionOrigin_Switch_RightStick_DPadEast = 216,
   k_EInputActionOrigin_Switch_DPad_North = 217,
   k_EInputActionOrigin_Switch_DPad_South = 218,
   k_EInputActionOrigin_Switch_DPad_West = 219,
   k_EInputActionOrigin_Switch_DPad_East = 220,
   k_EInputActionOrigin_Switch_ProGyro_Move = 221,
   k_EInputActionOrigin_Switch_ProGyro_Pitch = 222,
   k_EInputActionOrigin_Switch_ProGyro_Yaw = 223,
   k_EInputActionOrigin_Switch_ProGyro_Roll = 224,
   k_EInputActionOrigin_Switch_DPad_Move = 225,
   k_EInputActionOrigin_Switch_Reserved1 = 226,
   k_EInputActionOrigin_Switch_Reserved2 = 227,
   k_EInputActionOrigin_Switch_Reserved3 = 228,
   k_EInputActionOrigin_Switch_Reserved4 = 229,
   k_EInputActionOrigin_Switch_Reserved5 = 230,
   k_EInputActionOrigin_Switch_Reserved6 = 231,
   k_EInputActionOrigin_Switch_Reserved7 = 232,
   k_EInputActionOrigin_Switch_Reserved8 = 233,
   k_EInputActionOrigin_Switch_Reserved9 = 234,
   k_EInputActionOrigin_Switch_Reserved10 = 235,
   k_EInputActionOrigin_Switch_RightGyro_Move = 236,
   k_EInputActionOrigin_Switch_RightGyro_Pitch = 237,
   k_EInputActionOrigin_Switch_RightGyro_Yaw = 238,
   k_EInputActionOrigin_Switch_RightGyro_Roll = 239,
   k_EInputActionOrigin_Switch_LeftGyro_Move = 240,
   k_EInputActionOrigin_Switch_LeftGyro_Pitch = 241,
   k_EInputActionOrigin_Switch_LeftGyro_Yaw = 242,
   k_EInputActionOrigin_Switch_LeftGyro_Roll = 243,
   k_EInputActionOrigin_Switch_LeftGrip_Lower = 244,
   k_EInputActionOrigin_Switch_LeftGrip_Upper = 245,
   k_EInputActionOrigin_Switch_RightGrip_Lower = 246,
   k_EInputActionOrigin_Switch_RightGrip_Upper = 247,
   k_EInputActionOrigin_Switch_Reserved11 = 248,
   k_EInputActionOrigin_Switch_Reserved12 = 249,
   k_EInputActionOrigin_Switch_Reserved13 = 250,
   k_EInputActionOrigin_Switch_Reserved14 = 251,
   k_EInputActionOrigin_Switch_Reserved15 = 252,
   k_EInputActionOrigin_Switch_Reserved16 = 253,
   k_EInputActionOrigin_Switch_Reserved17 = 254,
   k_EInputActionOrigin_Switch_Reserved18 = 255,
   k_EInputActionOrigin_Switch_Reserved19 = 256,
   k_EInputActionOrigin_Switch_Reserved20 = 257,
   k_EInputActionOrigin_PS5_X = 258,
   k_EInputActionOrigin_PS5_Circle = 259,
   k_EInputActionOrigin_PS5_Triangle = 260,
   k_EInputActionOrigin_PS5_Square = 261,
   k_EInputActionOrigin_PS5_LeftBumper = 262,
   k_EInputActionOrigin_PS5_RightBumper = 263,
   k_EInputActionOrigin_PS5_Option = 264,
   k_EInputActionOrigin_PS5_Create = 265,
   k_EInputActionOrigin_PS5_Mute = 266,
   k_EInputActionOrigin_PS5_LeftPad_Touch = 267,
   k_EInputActionOrigin_PS5_LeftPad_Swipe = 268,
   k_EInputActionOrigin_PS5_LeftPad_Click = 269,
   k_EInputActionOrigin_PS5_LeftPad_DPadNorth = 270,
   k_EInputActionOrigin_PS5_LeftPad_DPadSouth = 271,
   k_EInputActionOrigin_PS5_LeftPad_DPadWest = 272,
   k_EInputActionOrigin_PS5_LeftPad_DPadEast = 273,
   k_EInputActionOrigin_PS5_RightPad_Touch = 274,
   k_EInputActionOrigin_PS5_RightPad_Swipe = 275,
   k_EInputActionOrigin_PS5_RightPad_Click = 276,
   k_EInputActionOrigin_PS5_RightPad_DPadNorth = 277,
   k_EInputActionOrigin_PS5_RightPad_DPadSouth = 278,
   k_EInputActionOrigin_PS5_RightPad_DPadWest = 279,
   k_EInputActionOrigin_PS5_RightPad_DPadEast = 280,
   k_EInputActionOrigin_PS5_CenterPad_Touch = 281,
   k_EInputActionOrigin_PS5_CenterPad_Swipe = 282,
   k_EInputActionOrigin_PS5_CenterPad_Click = 283,
   k_EInputActionOrigin_PS5_CenterPad_DPadNorth = 284,
   k_EInputActionOrigin_PS5_CenterPad_DPadSouth = 285,
   k_EInputActionOrigin_PS5_CenterPad_DPadWest = 286,
   k_EInputActionOrigin_PS5_CenterPad_DPadEast = 287,
   k_EInputActionOrigin_PS5_LeftTrigger_Pull = 288,
   k_EInputActionOrigin_PS5_LeftTrigger_Click = 289,
   k_EInputActionOrigin_PS5_RightTrigger_Pull = 290,
   k_EInputActionOrigin_PS5_RightTrigger_Click = 291,
   k_EInputActionOrigin_PS5_LeftStick_Move = 292,
   k_EInputActionOrigin_PS5_LeftStick_Click = 293,
   k_EInputActionOrigin_PS5_LeftStick_DPadNorth = 294,
   k_EInputActionOrigin_PS5_LeftStick_DPadSouth = 295,
   k_EInputActionOrigin_PS5_LeftStick_DPadWest = 296,
   k_EInputActionOrigin_PS5_LeftStick_DPadEast = 297,
   k_EInputActionOrigin_PS5_RightStick_Move = 298,
   k_EInputActionOrigin_PS5_RightStick_Click = 299,
   k_EInputActionOrigin_PS5_RightStick_DPadNorth = 300,
   k_EInputActionOrigin_PS5_RightStick_DPadSouth = 301,
   k_EInputActionOrigin_PS5_RightStick_DPadWest = 302,
   k_EInputActionOrigin_PS5_RightStick_DPadEast = 303,
   k_EInputActionOrigin_PS5_DPad_North = 304,
   k_EInputActionOrigin_PS5_DPad_South = 305,
   k_EInputActionOrigin_PS5_DPad_West = 306,
   k_EInputActionOrigin_PS5_DPad_East = 307,
   k_EInputActionOrigin_PS5_Gyro_Move = 308,
   k_EInputActionOrigin_PS5_Gyro_Pitch = 309,
   k_EInputActionOrigin_PS5_Gyro_Yaw = 310,
   k_EInputActionOrigin_PS5_Gyro_Roll = 311,
   k_EInputActionOrigin_PS5_DPad_Move = 312,
   k_EInputActionOrigin_PS5_Reserved1 = 313,
   k_EInputActionOrigin_PS5_Reserved2 = 314,
   k_EInputActionOrigin_PS5_Reserved3 = 315,
   k_EInputActionOrigin_PS5_Reserved4 = 316,
   k_EInputActionOrigin_PS5_Reserved5 = 317,
   k_EInputActionOrigin_PS5_Reserved6 = 318,
   k_EInputActionOrigin_PS5_Reserved7 = 319,
   k_EInputActionOrigin_PS5_Reserved8 = 320,
   k_EInputActionOrigin_PS5_Reserved9 = 321,
   k_EInputActionOrigin_PS5_Reserved10 = 322,
   k_EInputActionOrigin_PS5_Reserved11 = 323,
   k_EInputActionOrigin_PS5_Reserved12 = 324,
   k_EInputActionOrigin_PS5_Reserved13 = 325,
   k_EInputActionOrigin_PS5_Reserved14 = 326,
   k_EInputActionOrigin_PS5_Reserved15 = 327,
   k_EInputActionOrigin_PS5_Reserved16 = 328,
   k_EInputActionOrigin_PS5_Reserved17 = 329,
   k_EInputActionOrigin_PS5_Reserved18 = 330,
   k_EInputActionOrigin_PS5_Reserved19 = 331,
   k_EInputActionOrigin_PS5_Reserved20 = 332,
   k_EInputActionOrigin_SteamDeck_A = 333,
   k_EInputActionOrigin_SteamDeck_B = 334,
   k_EInputActionOrigin_SteamDeck_X = 335,
   k_EInputActionOrigin_SteamDeck_Y = 336,
   k_EInputActionOrigin_SteamDeck_L1 = 337,
   k_EInputActionOrigin_SteamDeck_R1 = 338,
   k_EInputActionOrigin_SteamDeck_Menu = 339,
   k_EInputActionOrigin_SteamDeck_View = 340,
   k_EInputActionOrigin_SteamDeck_LeftPad_Touch = 341,
   k_EInputActionOrigin_SteamDeck_LeftPad_Swipe = 342,
   k_EInputActionOrigin_SteamDeck_LeftPad_Click = 343,
   k_EInputActionOrigin_SteamDeck_LeftPad_DPadNorth = 344,
   k_EInputActionOrigin_SteamDeck_LeftPad_DPadSouth = 345,
   k_EInputActionOrigin_SteamDeck_LeftPad_DPadWest = 346,
   k_EInputActionOrigin_SteamDeck_LeftPad_DPadEast = 347,
   k_EInputActionOrigin_SteamDeck_RightPad_Touch = 348,
   k_EInputActionOrigin_SteamDeck_RightPad_Swipe = 349,
   k_EInputActionOrigin_SteamDeck_RightPad_Click = 350,
   k_EInputActionOrigin_SteamDeck_RightPad_DPadNorth = 351,
   k_EInputActionOrigin_SteamDeck_RightPad_DPadSouth = 352,
   k_EInputActionOrigin_SteamDeck_RightPad_DPadWest = 353,
   k_EInputActionOrigin_SteamDeck_RightPad_DPadEast = 354,
   k_EInputActionOrigin_SteamDeck_L2_SoftPull = 355,
   k_EInputActionOrigin_SteamDeck_L2 = 356,
   k_EInputActionOrigin_SteamDeck_R2_SoftPull = 357,
   k_EInputActionOrigin_SteamDeck_R2 = 358,
   k_EInputActionOrigin_SteamDeck_LeftStick_Move = 359,
   k_EInputActionOrigin_SteamDeck_L3 = 360,
   k_EInputActionOrigin_SteamDeck_LeftStick_DPadNorth = 361,
   k_EInputActionOrigin_SteamDeck_LeftStick_DPadSouth = 362,
   k_EInputActionOrigin_SteamDeck_LeftStick_DPadWest = 363,
   k_EInputActionOrigin_SteamDeck_LeftStick_DPadEast = 364,
   k_EInputActionOrigin_SteamDeck_LeftStick_Touch = 365,
   k_EInputActionOrigin_SteamDeck_RightStick_Move = 366,
   k_EInputActionOrigin_SteamDeck_R3 = 367,
   k_EInputActionOrigin_SteamDeck_RightStick_DPadNorth = 368,
   k_EInputActionOrigin_SteamDeck_RightStick_DPadSouth = 369,
   k_EInputActionOrigin_SteamDeck_RightStick_DPadWest = 370,
   k_EInputActionOrigin_SteamDeck_RightStick_DPadEast = 371,
   k_EInputActionOrigin_SteamDeck_RightStick_Touch = 372,
   k_EInputActionOrigin_SteamDeck_L4 = 373,
   k_EInputActionOrigin_SteamDeck_R4 = 374,
   k_EInputActionOrigin_SteamDeck_L5 = 375,
   k_EInputActionOrigin_SteamDeck_R5 = 376,
   k_EInputActionOrigin_SteamDeck_DPad_Move = 377,
   k_EInputActionOrigin_SteamDeck_DPad_North = 378,
   k_EInputActionOrigin_SteamDeck_DPad_South = 379,
   k_EInputActionOrigin_SteamDeck_DPad_West = 380,
   k_EInputActionOrigin_SteamDeck_DPad_East = 381,
   k_EInputActionOrigin_SteamDeck_Gyro_Move = 382,
   k_EInputActionOrigin_SteamDeck_Gyro_Pitch = 383,
   k_EInputActionOrigin_SteamDeck_Gyro_Yaw = 384,
   k_EInputActionOrigin_SteamDeck_Gyro_Roll = 385,
   k_EInputActionOrigin_SteamDeck_Reserved1 = 386,
   k_EInputActionOrigin_SteamDeck_Reserved2 = 387,
   k_EInputActionOrigin_SteamDeck_Reserved3 = 388,
   k_EInputActionOrigin_SteamDeck_Reserved4 = 389,
   k_EInputActionOrigin_SteamDeck_Reserved5 = 390,
   k_EInputActionOrigin_SteamDeck_Reserved6 = 391,
   k_EInputActionOrigin_SteamDeck_Reserved7 = 392,
   k_EInputActionOrigin_SteamDeck_Reserved8 = 393,
   k_EInputActionOrigin_SteamDeck_Reserved9 = 394,
   k_EInputActionOrigin_SteamDeck_Reserved10 = 395,
   k_EInputActionOrigin_SteamDeck_Reserved11 = 396,
   k_EInputActionOrigin_SteamDeck_Reserved12 = 397,
   k_EInputActionOrigin_SteamDeck_Reserved13 = 398,
   k_EInputActionOrigin_SteamDeck_Reserved14 = 399,
   k_EInputActionOrigin_SteamDeck_Reserved15 = 400,
   k_EInputActionOrigin_SteamDeck_Reserved16 = 401,
   k_EInputActionOrigin_SteamDeck_Reserved17 = 402,
   k_EInputActionOrigin_SteamDeck_Reserved18 = 403,
   k_EInputActionOrigin_SteamDeck_Reserved19 = 404,
   k_EInputActionOrigin_SteamDeck_Reserved20 = 405,
   k_EInputActionOrigin_Count = 406,
   k_EInputActionOrigin_MaximumPossibleValue = 32767,
}
export enum EXboxOrigin {
   k_EXboxOrigin_A = 0,
   k_EXboxOrigin_B = 1,
   k_EXboxOrigin_X = 2,
   k_EXboxOrigin_Y = 3,
   k_EXboxOrigin_LeftBumper = 4,
   k_EXboxOrigin_RightBumper = 5,
   k_EXboxOrigin_Menu = 6,
   k_EXboxOrigin_View = 7,
   k_EXboxOrigin_LeftTrigger_Pull = 8,
   k_EXboxOrigin_LeftTrigger_Click = 9,
   k_EXboxOrigin_RightTrigger_Pull = 10,
   k_EXboxOrigin_RightTrigger_Click = 11,
   k_EXboxOrigin_LeftStick_Move = 12,
   k_EXboxOrigin_LeftStick_Click = 13,
   k_EXboxOrigin_LeftStick_DPadNorth = 14,
   k_EXboxOrigin_LeftStick_DPadSouth = 15,
   k_EXboxOrigin_LeftStick_DPadWest = 16,
   k_EXboxOrigin_LeftStick_DPadEast = 17,
   k_EXboxOrigin_RightStick_Move = 18,
   k_EXboxOrigin_RightStick_Click = 19,
   k_EXboxOrigin_RightStick_DPadNorth = 20,
   k_EXboxOrigin_RightStick_DPadSouth = 21,
   k_EXboxOrigin_RightStick_DPadWest = 22,
   k_EXboxOrigin_RightStick_DPadEast = 23,
   k_EXboxOrigin_DPad_North = 24,
   k_EXboxOrigin_DPad_South = 25,
   k_EXboxOrigin_DPad_West = 26,
   k_EXboxOrigin_DPad_East = 27,
   k_EXboxOrigin_Count = 28,
}
export enum ESteamControllerPad {
   k_ESteamControllerPad_Left = 0,
   k_ESteamControllerPad_Right = 1,
}
export enum EControllerHapticLocation {
   k_EControllerHapticLocation_Left = 1,
   k_EControllerHapticLocation_Right = 2,
   k_EControllerHapticLocation_Both = 3,
}
export enum EControllerHapticType {
   k_EControllerHapticType_Off = 0,
   k_EControllerHapticType_Tick = 1,
   k_EControllerHapticType_Click = 2,
}
export enum ESteamInputType {
   k_ESteamInputType_Unknown = 0,
   k_ESteamInputType_SteamController = 1,
   k_ESteamInputType_XBox360Controller = 2,
   k_ESteamInputType_XBoxOneController = 3,
   k_ESteamInputType_GenericGamepad = 4,
   k_ESteamInputType_PS4Controller = 5,
   k_ESteamInputType_AppleMFiController = 6,
   k_ESteamInputType_AndroidController = 7,
   k_ESteamInputType_SwitchJoyConPair = 8,
   k_ESteamInputType_SwitchJoyConSingle = 9,
   k_ESteamInputType_SwitchProController = 10,
   k_ESteamInputType_MobileTouch = 11,
   k_ESteamInputType_PS3Controller = 12,
   k_ESteamInputType_PS5Controller = 13,
   k_ESteamInputType_SteamDeckController = 14,
   k_ESteamInputType_Count = 15,
   k_ESteamInputType_MaximumPossibleValue = 255,
}
export enum ESteamInputConfigurationEnableType {
   k_ESteamInputConfigurationEnableType_None = 0,
   k_ESteamInputConfigurationEnableType_Playstation = 1,
   k_ESteamInputConfigurationEnableType_Xbox = 2,
   k_ESteamInputConfigurationEnableType_Generic = 4,
   k_ESteamInputConfigurationEnableType_Switch = 8,
}
export enum ESteamInputLEDFlag {
   k_ESteamInputLEDFlag_SetColor = 0,
   k_ESteamInputLEDFlag_RestoreUserDefault = 1,
}
export enum ESteamInputGlyphSize {
   k_ESteamInputGlyphSize_Small = 0,
   k_ESteamInputGlyphSize_Medium = 1,
   k_ESteamInputGlyphSize_Large = 2,
   k_ESteamInputGlyphSize_Count = 3,
}
export enum ESteamInputGlyphStyle {
   ESteamInputGlyphStyle_Knockout = 0,
   ESteamInputGlyphStyle_Light = 1,
   ESteamInputGlyphStyle_Dark = 2,
   ESteamInputGlyphStyle_NeutralColorABXY = 16,
   ESteamInputGlyphStyle_SolidABXY = 32,
}
export enum ESteamInputActionEventType {
   ESteamInputActionEventType_DigitalAction = 0,
   ESteamInputActionEventType_AnalogAction = 1,
}
export enum EControllerActionOrigin {
   k_EControllerActionOrigin_None = 0,
   k_EControllerActionOrigin_A = 1,
   k_EControllerActionOrigin_B = 2,
   k_EControllerActionOrigin_X = 3,
   k_EControllerActionOrigin_Y = 4,
   k_EControllerActionOrigin_LeftBumper = 5,
   k_EControllerActionOrigin_RightBumper = 6,
   k_EControllerActionOrigin_LeftGrip = 7,
   k_EControllerActionOrigin_RightGrip = 8,
   k_EControllerActionOrigin_Start = 9,
   k_EControllerActionOrigin_Back = 10,
   k_EControllerActionOrigin_LeftPad_Touch = 11,
   k_EControllerActionOrigin_LeftPad_Swipe = 12,
   k_EControllerActionOrigin_LeftPad_Click = 13,
   k_EControllerActionOrigin_LeftPad_DPadNorth = 14,
   k_EControllerActionOrigin_LeftPad_DPadSouth = 15,
   k_EControllerActionOrigin_LeftPad_DPadWest = 16,
   k_EControllerActionOrigin_LeftPad_DPadEast = 17,
   k_EControllerActionOrigin_RightPad_Touch = 18,
   k_EControllerActionOrigin_RightPad_Swipe = 19,
   k_EControllerActionOrigin_RightPad_Click = 20,
   k_EControllerActionOrigin_RightPad_DPadNorth = 21,
   k_EControllerActionOrigin_RightPad_DPadSouth = 22,
   k_EControllerActionOrigin_RightPad_DPadWest = 23,
   k_EControllerActionOrigin_RightPad_DPadEast = 24,
   k_EControllerActionOrigin_LeftTrigger_Pull = 25,
   k_EControllerActionOrigin_LeftTrigger_Click = 26,
   k_EControllerActionOrigin_RightTrigger_Pull = 27,
   k_EControllerActionOrigin_RightTrigger_Click = 28,
   k_EControllerActionOrigin_LeftStick_Move = 29,
   k_EControllerActionOrigin_LeftStick_Click = 30,
   k_EControllerActionOrigin_LeftStick_DPadNorth = 31,
   k_EControllerActionOrigin_LeftStick_DPadSouth = 32,
   k_EControllerActionOrigin_LeftStick_DPadWest = 33,
   k_EControllerActionOrigin_LeftStick_DPadEast = 34,
   k_EControllerActionOrigin_Gyro_Move = 35,
   k_EControllerActionOrigin_Gyro_Pitch = 36,
   k_EControllerActionOrigin_Gyro_Yaw = 37,
   k_EControllerActionOrigin_Gyro_Roll = 38,
   k_EControllerActionOrigin_PS4_X = 39,
   k_EControllerActionOrigin_PS4_Circle = 40,
   k_EControllerActionOrigin_PS4_Triangle = 41,
   k_EControllerActionOrigin_PS4_Square = 42,
   k_EControllerActionOrigin_PS4_LeftBumper = 43,
   k_EControllerActionOrigin_PS4_RightBumper = 44,
   k_EControllerActionOrigin_PS4_Options = 45,
   k_EControllerActionOrigin_PS4_Share = 46,
   k_EControllerActionOrigin_PS4_LeftPad_Touch = 47,
   k_EControllerActionOrigin_PS4_LeftPad_Swipe = 48,
   k_EControllerActionOrigin_PS4_LeftPad_Click = 49,
   k_EControllerActionOrigin_PS4_LeftPad_DPadNorth = 50,
   k_EControllerActionOrigin_PS4_LeftPad_DPadSouth = 51,
   k_EControllerActionOrigin_PS4_LeftPad_DPadWest = 52,
   k_EControllerActionOrigin_PS4_LeftPad_DPadEast = 53,
   k_EControllerActionOrigin_PS4_RightPad_Touch = 54,
   k_EControllerActionOrigin_PS4_RightPad_Swipe = 55,
   k_EControllerActionOrigin_PS4_RightPad_Click = 56,
   k_EControllerActionOrigin_PS4_RightPad_DPadNorth = 57,
   k_EControllerActionOrigin_PS4_RightPad_DPadSouth = 58,
   k_EControllerActionOrigin_PS4_RightPad_DPadWest = 59,
   k_EControllerActionOrigin_PS4_RightPad_DPadEast = 60,
   k_EControllerActionOrigin_PS4_CenterPad_Touch = 61,
   k_EControllerActionOrigin_PS4_CenterPad_Swipe = 62,
   k_EControllerActionOrigin_PS4_CenterPad_Click = 63,
   k_EControllerActionOrigin_PS4_CenterPad_DPadNorth = 64,
   k_EControllerActionOrigin_PS4_CenterPad_DPadSouth = 65,
   k_EControllerActionOrigin_PS4_CenterPad_DPadWest = 66,
   k_EControllerActionOrigin_PS4_CenterPad_DPadEast = 67,
   k_EControllerActionOrigin_PS4_LeftTrigger_Pull = 68,
   k_EControllerActionOrigin_PS4_LeftTrigger_Click = 69,
   k_EControllerActionOrigin_PS4_RightTrigger_Pull = 70,
   k_EControllerActionOrigin_PS4_RightTrigger_Click = 71,
   k_EControllerActionOrigin_PS4_LeftStick_Move = 72,
   k_EControllerActionOrigin_PS4_LeftStick_Click = 73,
   k_EControllerActionOrigin_PS4_LeftStick_DPadNorth = 74,
   k_EControllerActionOrigin_PS4_LeftStick_DPadSouth = 75,
   k_EControllerActionOrigin_PS4_LeftStick_DPadWest = 76,
   k_EControllerActionOrigin_PS4_LeftStick_DPadEast = 77,
   k_EControllerActionOrigin_PS4_RightStick_Move = 78,
   k_EControllerActionOrigin_PS4_RightStick_Click = 79,
   k_EControllerActionOrigin_PS4_RightStick_DPadNorth = 80,
   k_EControllerActionOrigin_PS4_RightStick_DPadSouth = 81,
   k_EControllerActionOrigin_PS4_RightStick_DPadWest = 82,
   k_EControllerActionOrigin_PS4_RightStick_DPadEast = 83,
   k_EControllerActionOrigin_PS4_DPad_North = 84,
   k_EControllerActionOrigin_PS4_DPad_South = 85,
   k_EControllerActionOrigin_PS4_DPad_West = 86,
   k_EControllerActionOrigin_PS4_DPad_East = 87,
   k_EControllerActionOrigin_PS4_Gyro_Move = 88,
   k_EControllerActionOrigin_PS4_Gyro_Pitch = 89,
   k_EControllerActionOrigin_PS4_Gyro_Yaw = 90,
   k_EControllerActionOrigin_PS4_Gyro_Roll = 91,
   k_EControllerActionOrigin_XBoxOne_A = 92,
   k_EControllerActionOrigin_XBoxOne_B = 93,
   k_EControllerActionOrigin_XBoxOne_X = 94,
   k_EControllerActionOrigin_XBoxOne_Y = 95,
   k_EControllerActionOrigin_XBoxOne_LeftBumper = 96,
   k_EControllerActionOrigin_XBoxOne_RightBumper = 97,
   k_EControllerActionOrigin_XBoxOne_Menu = 98,
   k_EControllerActionOrigin_XBoxOne_View = 99,
   k_EControllerActionOrigin_XBoxOne_LeftTrigger_Pull = 100,
   k_EControllerActionOrigin_XBoxOne_LeftTrigger_Click = 101,
   k_EControllerActionOrigin_XBoxOne_RightTrigger_Pull = 102,
   k_EControllerActionOrigin_XBoxOne_RightTrigger_Click = 103,
   k_EControllerActionOrigin_XBoxOne_LeftStick_Move = 104,
   k_EControllerActionOrigin_XBoxOne_LeftStick_Click = 105,
   k_EControllerActionOrigin_XBoxOne_LeftStick_DPadNorth = 106,
   k_EControllerActionOrigin_XBoxOne_LeftStick_DPadSouth = 107,
   k_EControllerActionOrigin_XBoxOne_LeftStick_DPadWest = 108,
   k_EControllerActionOrigin_XBoxOne_LeftStick_DPadEast = 109,
   k_EControllerActionOrigin_XBoxOne_RightStick_Move = 110,
   k_EControllerActionOrigin_XBoxOne_RightStick_Click = 111,
   k_EControllerActionOrigin_XBoxOne_RightStick_DPadNorth = 112,
   k_EControllerActionOrigin_XBoxOne_RightStick_DPadSouth = 113,
   k_EControllerActionOrigin_XBoxOne_RightStick_DPadWest = 114,
   k_EControllerActionOrigin_XBoxOne_RightStick_DPadEast = 115,
   k_EControllerActionOrigin_XBoxOne_DPad_North = 116,
   k_EControllerActionOrigin_XBoxOne_DPad_South = 117,
   k_EControllerActionOrigin_XBoxOne_DPad_West = 118,
   k_EControllerActionOrigin_XBoxOne_DPad_East = 119,
   k_EControllerActionOrigin_XBox360_A = 120,
   k_EControllerActionOrigin_XBox360_B = 121,
   k_EControllerActionOrigin_XBox360_X = 122,
   k_EControllerActionOrigin_XBox360_Y = 123,
   k_EControllerActionOrigin_XBox360_LeftBumper = 124,
   k_EControllerActionOrigin_XBox360_RightBumper = 125,
   k_EControllerActionOrigin_XBox360_Start = 126,
   k_EControllerActionOrigin_XBox360_Back = 127,
   k_EControllerActionOrigin_XBox360_LeftTrigger_Pull = 128,
   k_EControllerActionOrigin_XBox360_LeftTrigger_Click = 129,
   k_EControllerActionOrigin_XBox360_RightTrigger_Pull = 130,
   k_EControllerActionOrigin_XBox360_RightTrigger_Click = 131,
   k_EControllerActionOrigin_XBox360_LeftStick_Move = 132,
   k_EControllerActionOrigin_XBox360_LeftStick_Click = 133,
   k_EControllerActionOrigin_XBox360_LeftStick_DPadNorth = 134,
   k_EControllerActionOrigin_XBox360_LeftStick_DPadSouth = 135,
   k_EControllerActionOrigin_XBox360_LeftStick_DPadWest = 136,
   k_EControllerActionOrigin_XBox360_LeftStick_DPadEast = 137,
   k_EControllerActionOrigin_XBox360_RightStick_Move = 138,
   k_EControllerActionOrigin_XBox360_RightStick_Click = 139,
   k_EControllerActionOrigin_XBox360_RightStick_DPadNorth = 140,
   k_EControllerActionOrigin_XBox360_RightStick_DPadSouth = 141,
   k_EControllerActionOrigin_XBox360_RightStick_DPadWest = 142,
   k_EControllerActionOrigin_XBox360_RightStick_DPadEast = 143,
   k_EControllerActionOrigin_XBox360_DPad_North = 144,
   k_EControllerActionOrigin_XBox360_DPad_South = 145,
   k_EControllerActionOrigin_XBox360_DPad_West = 146,
   k_EControllerActionOrigin_XBox360_DPad_East = 147,
   k_EControllerActionOrigin_SteamV2_A = 148,
   k_EControllerActionOrigin_SteamV2_B = 149,
   k_EControllerActionOrigin_SteamV2_X = 150,
   k_EControllerActionOrigin_SteamV2_Y = 151,
   k_EControllerActionOrigin_SteamV2_LeftBumper = 152,
   k_EControllerActionOrigin_SteamV2_RightBumper = 153,
   k_EControllerActionOrigin_SteamV2_LeftGrip_Lower = 154,
   k_EControllerActionOrigin_SteamV2_LeftGrip_Upper = 155,
   k_EControllerActionOrigin_SteamV2_RightGrip_Lower = 156,
   k_EControllerActionOrigin_SteamV2_RightGrip_Upper = 157,
   k_EControllerActionOrigin_SteamV2_LeftBumper_Pressure = 158,
   k_EControllerActionOrigin_SteamV2_RightBumper_Pressure = 159,
   k_EControllerActionOrigin_SteamV2_LeftGrip_Pressure = 160,
   k_EControllerActionOrigin_SteamV2_RightGrip_Pressure = 161,
   k_EControllerActionOrigin_SteamV2_LeftGrip_Upper_Pressure = 162,
   k_EControllerActionOrigin_SteamV2_RightGrip_Upper_Pressure = 163,
   k_EControllerActionOrigin_SteamV2_Start = 164,
   k_EControllerActionOrigin_SteamV2_Back = 165,
   k_EControllerActionOrigin_SteamV2_LeftPad_Touch = 166,
   k_EControllerActionOrigin_SteamV2_LeftPad_Swipe = 167,
   k_EControllerActionOrigin_SteamV2_LeftPad_Click = 168,
   k_EControllerActionOrigin_SteamV2_LeftPad_Pressure = 169,
   k_EControllerActionOrigin_SteamV2_LeftPad_DPadNorth = 170,
   k_EControllerActionOrigin_SteamV2_LeftPad_DPadSouth = 171,
   k_EControllerActionOrigin_SteamV2_LeftPad_DPadWest = 172,
   k_EControllerActionOrigin_SteamV2_LeftPad_DPadEast = 173,
   k_EControllerActionOrigin_SteamV2_RightPad_Touch = 174,
   k_EControllerActionOrigin_SteamV2_RightPad_Swipe = 175,
   k_EControllerActionOrigin_SteamV2_RightPad_Click = 176,
   k_EControllerActionOrigin_SteamV2_RightPad_Pressure = 177,
   k_EControllerActionOrigin_SteamV2_RightPad_DPadNorth = 178,
   k_EControllerActionOrigin_SteamV2_RightPad_DPadSouth = 179,
   k_EControllerActionOrigin_SteamV2_RightPad_DPadWest = 180,
   k_EControllerActionOrigin_SteamV2_RightPad_DPadEast = 181,
   k_EControllerActionOrigin_SteamV2_LeftTrigger_Pull = 182,
   k_EControllerActionOrigin_SteamV2_LeftTrigger_Click = 183,
   k_EControllerActionOrigin_SteamV2_RightTrigger_Pull = 184,
   k_EControllerActionOrigin_SteamV2_RightTrigger_Click = 185,
   k_EControllerActionOrigin_SteamV2_LeftStick_Move = 186,
   k_EControllerActionOrigin_SteamV2_LeftStick_Click = 187,
   k_EControllerActionOrigin_SteamV2_LeftStick_DPadNorth = 188,
   k_EControllerActionOrigin_SteamV2_LeftStick_DPadSouth = 189,
   k_EControllerActionOrigin_SteamV2_LeftStick_DPadWest = 190,
   k_EControllerActionOrigin_SteamV2_LeftStick_DPadEast = 191,
   k_EControllerActionOrigin_SteamV2_Gyro_Move = 192,
   k_EControllerActionOrigin_SteamV2_Gyro_Pitch = 193,
   k_EControllerActionOrigin_SteamV2_Gyro_Yaw = 194,
   k_EControllerActionOrigin_SteamV2_Gyro_Roll = 195,
   k_EControllerActionOrigin_Switch_A = 196,
   k_EControllerActionOrigin_Switch_B = 197,
   k_EControllerActionOrigin_Switch_X = 198,
   k_EControllerActionOrigin_Switch_Y = 199,
   k_EControllerActionOrigin_Switch_LeftBumper = 200,
   k_EControllerActionOrigin_Switch_RightBumper = 201,
   k_EControllerActionOrigin_Switch_Plus = 202,
   k_EControllerActionOrigin_Switch_Minus = 203,
   k_EControllerActionOrigin_Switch_Capture = 204,
   k_EControllerActionOrigin_Switch_LeftTrigger_Pull = 205,
   k_EControllerActionOrigin_Switch_LeftTrigger_Click = 206,
   k_EControllerActionOrigin_Switch_RightTrigger_Pull = 207,
   k_EControllerActionOrigin_Switch_RightTrigger_Click = 208,
   k_EControllerActionOrigin_Switch_LeftStick_Move = 209,
   k_EControllerActionOrigin_Switch_LeftStick_Click = 210,
   k_EControllerActionOrigin_Switch_LeftStick_DPadNorth = 211,
   k_EControllerActionOrigin_Switch_LeftStick_DPadSouth = 212,
   k_EControllerActionOrigin_Switch_LeftStick_DPadWest = 213,
   k_EControllerActionOrigin_Switch_LeftStick_DPadEast = 214,
   k_EControllerActionOrigin_Switch_RightStick_Move = 215,
   k_EControllerActionOrigin_Switch_RightStick_Click = 216,
   k_EControllerActionOrigin_Switch_RightStick_DPadNorth = 217,
   k_EControllerActionOrigin_Switch_RightStick_DPadSouth = 218,
   k_EControllerActionOrigin_Switch_RightStick_DPadWest = 219,
   k_EControllerActionOrigin_Switch_RightStick_DPadEast = 220,
   k_EControllerActionOrigin_Switch_DPad_North = 221,
   k_EControllerActionOrigin_Switch_DPad_South = 222,
   k_EControllerActionOrigin_Switch_DPad_West = 223,
   k_EControllerActionOrigin_Switch_DPad_East = 224,
   k_EControllerActionOrigin_Switch_ProGyro_Move = 225,
   k_EControllerActionOrigin_Switch_ProGyro_Pitch = 226,
   k_EControllerActionOrigin_Switch_ProGyro_Yaw = 227,
   k_EControllerActionOrigin_Switch_ProGyro_Roll = 228,
   k_EControllerActionOrigin_Switch_RightGyro_Move = 229,
   k_EControllerActionOrigin_Switch_RightGyro_Pitch = 230,
   k_EControllerActionOrigin_Switch_RightGyro_Yaw = 231,
   k_EControllerActionOrigin_Switch_RightGyro_Roll = 232,
   k_EControllerActionOrigin_Switch_LeftGyro_Move = 233,
   k_EControllerActionOrigin_Switch_LeftGyro_Pitch = 234,
   k_EControllerActionOrigin_Switch_LeftGyro_Yaw = 235,
   k_EControllerActionOrigin_Switch_LeftGyro_Roll = 236,
   k_EControllerActionOrigin_Switch_LeftGrip_Lower = 237,
   k_EControllerActionOrigin_Switch_LeftGrip_Upper = 238,
   k_EControllerActionOrigin_Switch_RightGrip_Lower = 239,
   k_EControllerActionOrigin_Switch_RightGrip_Upper = 240,
   k_EControllerActionOrigin_PS4_DPad_Move = 241,
   k_EControllerActionOrigin_XBoxOne_DPad_Move = 242,
   k_EControllerActionOrigin_XBox360_DPad_Move = 243,
   k_EControllerActionOrigin_Switch_DPad_Move = 244,
   k_EControllerActionOrigin_PS5_X = 245,
   k_EControllerActionOrigin_PS5_Circle = 246,
   k_EControllerActionOrigin_PS5_Triangle = 247,
   k_EControllerActionOrigin_PS5_Square = 248,
   k_EControllerActionOrigin_PS5_LeftBumper = 249,
   k_EControllerActionOrigin_PS5_RightBumper = 250,
   k_EControllerActionOrigin_PS5_Option = 251,
   k_EControllerActionOrigin_PS5_Create = 252,
   k_EControllerActionOrigin_PS5_Mute = 253,
   k_EControllerActionOrigin_PS5_LeftPad_Touch = 254,
   k_EControllerActionOrigin_PS5_LeftPad_Swipe = 255,
   k_EControllerActionOrigin_PS5_LeftPad_Click = 256,
   k_EControllerActionOrigin_PS5_LeftPad_DPadNorth = 257,
   k_EControllerActionOrigin_PS5_LeftPad_DPadSouth = 258,
   k_EControllerActionOrigin_PS5_LeftPad_DPadWest = 259,
   k_EControllerActionOrigin_PS5_LeftPad_DPadEast = 260,
   k_EControllerActionOrigin_PS5_RightPad_Touch = 261,
   k_EControllerActionOrigin_PS5_RightPad_Swipe = 262,
   k_EControllerActionOrigin_PS5_RightPad_Click = 263,
   k_EControllerActionOrigin_PS5_RightPad_DPadNorth = 264,
   k_EControllerActionOrigin_PS5_RightPad_DPadSouth = 265,
   k_EControllerActionOrigin_PS5_RightPad_DPadWest = 266,
   k_EControllerActionOrigin_PS5_RightPad_DPadEast = 267,
   k_EControllerActionOrigin_PS5_CenterPad_Touch = 268,
   k_EControllerActionOrigin_PS5_CenterPad_Swipe = 269,
   k_EControllerActionOrigin_PS5_CenterPad_Click = 270,
   k_EControllerActionOrigin_PS5_CenterPad_DPadNorth = 271,
   k_EControllerActionOrigin_PS5_CenterPad_DPadSouth = 272,
   k_EControllerActionOrigin_PS5_CenterPad_DPadWest = 273,
   k_EControllerActionOrigin_PS5_CenterPad_DPadEast = 274,
   k_EControllerActionOrigin_PS5_LeftTrigger_Pull = 275,
   k_EControllerActionOrigin_PS5_LeftTrigger_Click = 276,
   k_EControllerActionOrigin_PS5_RightTrigger_Pull = 277,
   k_EControllerActionOrigin_PS5_RightTrigger_Click = 278,
   k_EControllerActionOrigin_PS5_LeftStick_Move = 279,
   k_EControllerActionOrigin_PS5_LeftStick_Click = 280,
   k_EControllerActionOrigin_PS5_LeftStick_DPadNorth = 281,
   k_EControllerActionOrigin_PS5_LeftStick_DPadSouth = 282,
   k_EControllerActionOrigin_PS5_LeftStick_DPadWest = 283,
   k_EControllerActionOrigin_PS5_LeftStick_DPadEast = 284,
   k_EControllerActionOrigin_PS5_RightStick_Move = 285,
   k_EControllerActionOrigin_PS5_RightStick_Click = 286,
   k_EControllerActionOrigin_PS5_RightStick_DPadNorth = 287,
   k_EControllerActionOrigin_PS5_RightStick_DPadSouth = 288,
   k_EControllerActionOrigin_PS5_RightStick_DPadWest = 289,
   k_EControllerActionOrigin_PS5_RightStick_DPadEast = 290,
   k_EControllerActionOrigin_PS5_DPad_Move = 291,
   k_EControllerActionOrigin_PS5_DPad_North = 292,
   k_EControllerActionOrigin_PS5_DPad_South = 293,
   k_EControllerActionOrigin_PS5_DPad_West = 294,
   k_EControllerActionOrigin_PS5_DPad_East = 295,
   k_EControllerActionOrigin_PS5_Gyro_Move = 296,
   k_EControllerActionOrigin_PS5_Gyro_Pitch = 297,
   k_EControllerActionOrigin_PS5_Gyro_Yaw = 298,
   k_EControllerActionOrigin_PS5_Gyro_Roll = 299,
   k_EControllerActionOrigin_XBoxOne_LeftGrip_Lower = 300,
   k_EControllerActionOrigin_XBoxOne_LeftGrip_Upper = 301,
   k_EControllerActionOrigin_XBoxOne_RightGrip_Lower = 302,
   k_EControllerActionOrigin_XBoxOne_RightGrip_Upper = 303,
   k_EControllerActionOrigin_XBoxOne_Share = 304,
   k_EControllerActionOrigin_SteamDeck_A = 305,
   k_EControllerActionOrigin_SteamDeck_B = 306,
   k_EControllerActionOrigin_SteamDeck_X = 307,
   k_EControllerActionOrigin_SteamDeck_Y = 308,
   k_EControllerActionOrigin_SteamDeck_L1 = 309,
   k_EControllerActionOrigin_SteamDeck_R1 = 310,
   k_EControllerActionOrigin_SteamDeck_Menu = 311,
   k_EControllerActionOrigin_SteamDeck_View = 312,
   k_EControllerActionOrigin_SteamDeck_LeftPad_Touch = 313,
   k_EControllerActionOrigin_SteamDeck_LeftPad_Swipe = 314,
   k_EControllerActionOrigin_SteamDeck_LeftPad_Click = 315,
   k_EControllerActionOrigin_SteamDeck_LeftPad_DPadNorth = 316,
   k_EControllerActionOrigin_SteamDeck_LeftPad_DPadSouth = 317,
   k_EControllerActionOrigin_SteamDeck_LeftPad_DPadWest = 318,
   k_EControllerActionOrigin_SteamDeck_LeftPad_DPadEast = 319,
   k_EControllerActionOrigin_SteamDeck_RightPad_Touch = 320,
   k_EControllerActionOrigin_SteamDeck_RightPad_Swipe = 321,
   k_EControllerActionOrigin_SteamDeck_RightPad_Click = 322,
   k_EControllerActionOrigin_SteamDeck_RightPad_DPadNorth = 323,
   k_EControllerActionOrigin_SteamDeck_RightPad_DPadSouth = 324,
   k_EControllerActionOrigin_SteamDeck_RightPad_DPadWest = 325,
   k_EControllerActionOrigin_SteamDeck_RightPad_DPadEast = 326,
   k_EControllerActionOrigin_SteamDeck_L2_SoftPull = 327,
   k_EControllerActionOrigin_SteamDeck_L2 = 328,
   k_EControllerActionOrigin_SteamDeck_R2_SoftPull = 329,
   k_EControllerActionOrigin_SteamDeck_R2 = 330,
   k_EControllerActionOrigin_SteamDeck_LeftStick_Move = 331,
   k_EControllerActionOrigin_SteamDeck_L3 = 332,
   k_EControllerActionOrigin_SteamDeck_LeftStick_DPadNorth = 333,
   k_EControllerActionOrigin_SteamDeck_LeftStick_DPadSouth = 334,
   k_EControllerActionOrigin_SteamDeck_LeftStick_DPadWest = 335,
   k_EControllerActionOrigin_SteamDeck_LeftStick_DPadEast = 336,
   k_EControllerActionOrigin_SteamDeck_LeftStick_Touch = 337,
   k_EControllerActionOrigin_SteamDeck_RightStick_Move = 338,
   k_EControllerActionOrigin_SteamDeck_R3 = 339,
   k_EControllerActionOrigin_SteamDeck_RightStick_DPadNorth = 340,
   k_EControllerActionOrigin_SteamDeck_RightStick_DPadSouth = 341,
   k_EControllerActionOrigin_SteamDeck_RightStick_DPadWest = 342,
   k_EControllerActionOrigin_SteamDeck_RightStick_DPadEast = 343,
   k_EControllerActionOrigin_SteamDeck_RightStick_Touch = 344,
   k_EControllerActionOrigin_SteamDeck_L4 = 345,
   k_EControllerActionOrigin_SteamDeck_R4 = 346,
   k_EControllerActionOrigin_SteamDeck_L5 = 347,
   k_EControllerActionOrigin_SteamDeck_R5 = 348,
   k_EControllerActionOrigin_SteamDeck_DPad_Move = 349,
   k_EControllerActionOrigin_SteamDeck_DPad_North = 350,
   k_EControllerActionOrigin_SteamDeck_DPad_South = 351,
   k_EControllerActionOrigin_SteamDeck_DPad_West = 352,
   k_EControllerActionOrigin_SteamDeck_DPad_East = 353,
   k_EControllerActionOrigin_SteamDeck_Gyro_Move = 354,
   k_EControllerActionOrigin_SteamDeck_Gyro_Pitch = 355,
   k_EControllerActionOrigin_SteamDeck_Gyro_Yaw = 356,
   k_EControllerActionOrigin_SteamDeck_Gyro_Roll = 357,
   k_EControllerActionOrigin_SteamDeck_Reserved1 = 358,
   k_EControllerActionOrigin_SteamDeck_Reserved2 = 359,
   k_EControllerActionOrigin_SteamDeck_Reserved3 = 360,
   k_EControllerActionOrigin_SteamDeck_Reserved4 = 361,
   k_EControllerActionOrigin_SteamDeck_Reserved5 = 362,
   k_EControllerActionOrigin_SteamDeck_Reserved6 = 363,
   k_EControllerActionOrigin_SteamDeck_Reserved7 = 364,
   k_EControllerActionOrigin_SteamDeck_Reserved8 = 365,
   k_EControllerActionOrigin_SteamDeck_Reserved9 = 366,
   k_EControllerActionOrigin_SteamDeck_Reserved10 = 367,
   k_EControllerActionOrigin_SteamDeck_Reserved11 = 368,
   k_EControllerActionOrigin_SteamDeck_Reserved12 = 369,
   k_EControllerActionOrigin_SteamDeck_Reserved13 = 370,
   k_EControllerActionOrigin_SteamDeck_Reserved14 = 371,
   k_EControllerActionOrigin_SteamDeck_Reserved15 = 372,
   k_EControllerActionOrigin_SteamDeck_Reserved16 = 373,
   k_EControllerActionOrigin_SteamDeck_Reserved17 = 374,
   k_EControllerActionOrigin_SteamDeck_Reserved18 = 375,
   k_EControllerActionOrigin_SteamDeck_Reserved19 = 376,
   k_EControllerActionOrigin_SteamDeck_Reserved20 = 377,
   k_EControllerActionOrigin_Count = 378,
   k_EControllerActionOrigin_MaximumPossibleValue = 32767,
}
export enum ESteamControllerLEDFlag {
   k_ESteamControllerLEDFlag_SetColor = 0,
   k_ESteamControllerLEDFlag_RestoreUserDefault = 1,
}
export enum EUGCMatchingUGCType {
   k_EUGCMatchingUGCType_Items = 0,
   k_EUGCMatchingUGCType_Items_Mtx = 1,
   k_EUGCMatchingUGCType_Items_ReadyToUse = 2,
   k_EUGCMatchingUGCType_Collections = 3,
   k_EUGCMatchingUGCType_Artwork = 4,
   k_EUGCMatchingUGCType_Videos = 5,
   k_EUGCMatchingUGCType_Screenshots = 6,
   k_EUGCMatchingUGCType_AllGuides = 7,
   k_EUGCMatchingUGCType_WebGuides = 8,
   k_EUGCMatchingUGCType_IntegratedGuides = 9,
   k_EUGCMatchingUGCType_UsableInGame = 10,
   k_EUGCMatchingUGCType_ControllerBindings = 11,
   k_EUGCMatchingUGCType_GameManagedItems = 12,
   k_EUGCMatchingUGCType_All = -1,
}
export enum EUserUGCList {
   k_EUserUGCList_Published = 0,
   k_EUserUGCList_VotedOn = 1,
   k_EUserUGCList_VotedUp = 2,
   k_EUserUGCList_VotedDown = 3,
   k_EUserUGCList_WillVoteLater = 4,
   k_EUserUGCList_Favorited = 5,
   k_EUserUGCList_Subscribed = 6,
   k_EUserUGCList_UsedOrPlayed = 7,
   k_EUserUGCList_Followed = 8,
}
export enum EUserUGCListSortOrder {
   k_EUserUGCListSortOrder_CreationOrderDesc = 0,
   k_EUserUGCListSortOrder_CreationOrderAsc = 1,
   k_EUserUGCListSortOrder_TitleAsc = 2,
   k_EUserUGCListSortOrder_LastUpdatedDesc = 3,
   k_EUserUGCListSortOrder_SubscriptionDateDesc = 4,
   k_EUserUGCListSortOrder_VoteScoreDesc = 5,
   k_EUserUGCListSortOrder_ForModeration = 6,
}
export enum EUGCQuery {
   k_EUGCQuery_RankedByVote = 0,
   k_EUGCQuery_RankedByPublicationDate = 1,
   k_EUGCQuery_AcceptedForGameRankedByAcceptanceDate = 2,
   k_EUGCQuery_RankedByTrend = 3,
   k_EUGCQuery_FavoritedByFriendsRankedByPublicationDate = 4,
   k_EUGCQuery_CreatedByFriendsRankedByPublicationDate = 5,
   k_EUGCQuery_RankedByNumTimesReported = 6,
   k_EUGCQuery_CreatedByFollowedUsersRankedByPublicationDate = 7,
   k_EUGCQuery_NotYetRated = 8,
   k_EUGCQuery_RankedByTotalVotesAsc = 9,
   k_EUGCQuery_RankedByVotesUp = 10,
   k_EUGCQuery_RankedByTextSearch = 11,
   k_EUGCQuery_RankedByTotalUniqueSubscriptions = 12,
   k_EUGCQuery_RankedByPlaytimeTrend = 13,
   k_EUGCQuery_RankedByTotalPlaytime = 14,
   k_EUGCQuery_RankedByAveragePlaytimeTrend = 15,
   k_EUGCQuery_RankedByLifetimeAveragePlaytime = 16,
   k_EUGCQuery_RankedByPlaytimeSessionsTrend = 17,
   k_EUGCQuery_RankedByLifetimePlaytimeSessions = 18,
   k_EUGCQuery_RankedByLastUpdatedDate = 19,
}
export enum EItemUpdateStatus {
   k_EItemUpdateStatusInvalid = 0,
   k_EItemUpdateStatusPreparingConfig = 1,
   k_EItemUpdateStatusPreparingContent = 2,
   k_EItemUpdateStatusUploadingContent = 3,
   k_EItemUpdateStatusUploadingPreviewFile = 4,
   k_EItemUpdateStatusCommittingChanges = 5,
}
export enum EItemState {
   k_EItemStateNone = 0,
   k_EItemStateSubscribed = 1,
   k_EItemStateLegacyItem = 2,
   k_EItemStateInstalled = 4,
   k_EItemStateNeedsUpdate = 8,
   k_EItemStateDownloading = 16,
   k_EItemStateDownloadPending = 32,
}
export enum EItemStatistic {
   k_EItemStatistic_NumSubscriptions = 0,
   k_EItemStatistic_NumFavorites = 1,
   k_EItemStatistic_NumFollowers = 2,
   k_EItemStatistic_NumUniqueSubscriptions = 3,
   k_EItemStatistic_NumUniqueFavorites = 4,
   k_EItemStatistic_NumUniqueFollowers = 5,
   k_EItemStatistic_NumUniqueWebsiteViews = 6,
   k_EItemStatistic_ReportScore = 7,
   k_EItemStatistic_NumSecondsPlayed = 8,
   k_EItemStatistic_NumPlaytimeSessions = 9,
   k_EItemStatistic_NumComments = 10,
   k_EItemStatistic_NumSecondsPlayedDuringTimePeriod = 11,
   k_EItemStatistic_NumPlaytimeSessionsDuringTimePeriod = 12,
}
export enum EItemPreviewType {
   k_EItemPreviewType_Image = 0,
   k_EItemPreviewType_YouTubeVideo = 1,
   k_EItemPreviewType_Sketchfab = 2,
   k_EItemPreviewType_EnvironmentMap_HorizontalCross = 3,
   k_EItemPreviewType_EnvironmentMap_LatLong = 4,
   k_EItemPreviewType_ReservedMax = 255,
}
export enum ESteamItemFlags {
   k_ESteamItemNoTrade = 1,
   k_ESteamItemRemoved = 256,
   k_ESteamItemConsumed = 512,
}
export enum EParentalFeature {
   k_EFeatureInvalid = 0,
   k_EFeatureStore = 1,
   k_EFeatureCommunity = 2,
   k_EFeatureProfile = 3,
   k_EFeatureFriends = 4,
   k_EFeatureNews = 5,
   k_EFeatureTrading = 6,
   k_EFeatureSettings = 7,
   k_EFeatureConsole = 8,
   k_EFeatureBrowser = 9,
   k_EFeatureParentalSetup = 10,
   k_EFeatureLibrary = 11,
   k_EFeatureTest = 12,
   k_EFeatureSiteLicense = 13,
   k_EFeatureMax = 14,
}
export enum ESteamDeviceFormFactor {
   k_ESteamDeviceFormFactorUnknown = 0,
   k_ESteamDeviceFormFactorPhone = 1,
   k_ESteamDeviceFormFactorTablet = 2,
   k_ESteamDeviceFormFactorComputer = 3,
   k_ESteamDeviceFormFactorTV = 4,
}
export enum ESteamNetworkingAvailability {
   k_ESteamNetworkingAvailability_CannotTry = -102,
   k_ESteamNetworkingAvailability_Failed = -101,
   k_ESteamNetworkingAvailability_Previously = -100,
   k_ESteamNetworkingAvailability_Retrying = -10,
   k_ESteamNetworkingAvailability_NeverTried = 1,
   k_ESteamNetworkingAvailability_Waiting = 2,
   k_ESteamNetworkingAvailability_Attempting = 3,
   k_ESteamNetworkingAvailability_Current = 100,
   k_ESteamNetworkingAvailability_Unknown = 0,
   k_ESteamNetworkingAvailability__Force32bit = 2147483647,
}
export enum ESteamNetworkingIdentityType {
   k_ESteamNetworkingIdentityType_Invalid = 0,
   k_ESteamNetworkingIdentityType_SteamID = 16,
   k_ESteamNetworkingIdentityType_XboxPairwiseID = 17,
   k_ESteamNetworkingIdentityType_SonyPSN = 18,
   k_ESteamNetworkingIdentityType_GoogleStadia = 19,
   k_ESteamNetworkingIdentityType_IPAddress = 1,
   k_ESteamNetworkingIdentityType_GenericString = 2,
   k_ESteamNetworkingIdentityType_GenericBytes = 3,
   k_ESteamNetworkingIdentityType_UnknownType = 4,
   k_ESteamNetworkingIdentityType__Force32bit = 2147483647,
}
export enum ESteamNetworkingFakeIPType {
   k_ESteamNetworkingFakeIPType_Invalid = 0,
   k_ESteamNetworkingFakeIPType_NotFake = 1,
   k_ESteamNetworkingFakeIPType_GlobalIPv4 = 2,
   k_ESteamNetworkingFakeIPType_LocalIPv4 = 3,
   k_ESteamNetworkingFakeIPType__Force32Bit = 2147483647,
}
export enum ESteamNetworkingConnectionState {
   k_ESteamNetworkingConnectionState_None = 0,
   k_ESteamNetworkingConnectionState_Connecting = 1,
   k_ESteamNetworkingConnectionState_FindingRoute = 2,
   k_ESteamNetworkingConnectionState_Connected = 3,
   k_ESteamNetworkingConnectionState_ClosedByPeer = 4,
   k_ESteamNetworkingConnectionState_ProblemDetectedLocally = 5,
   k_ESteamNetworkingConnectionState_FinWait = -1,
   k_ESteamNetworkingConnectionState_Linger = -2,
   k_ESteamNetworkingConnectionState_Dead = -3,
   k_ESteamNetworkingConnectionState__Force32Bit = 2147483647,
}
export enum ESteamNetConnectionEnd {
   k_ESteamNetConnectionEnd_Invalid = 0,
   k_ESteamNetConnectionEnd_App_Min = 1000,
   k_ESteamNetConnectionEnd_App_Generic = 1000,
   k_ESteamNetConnectionEnd_App_Max = 1999,
   k_ESteamNetConnectionEnd_AppException_Min = 2000,
   k_ESteamNetConnectionEnd_AppException_Generic = 2000,
   k_ESteamNetConnectionEnd_AppException_Max = 2999,
   k_ESteamNetConnectionEnd_Local_Min = 3000,
   k_ESteamNetConnectionEnd_Local_OfflineMode = 3001,
   k_ESteamNetConnectionEnd_Local_ManyRelayConnectivity = 3002,
   k_ESteamNetConnectionEnd_Local_HostedServerPrimaryRelay = 3003,
   k_ESteamNetConnectionEnd_Local_NetworkConfig = 3004,
   k_ESteamNetConnectionEnd_Local_Rights = 3005,
   k_ESteamNetConnectionEnd_Local_P2P_ICE_NoPublicAddresses = 3006,
   k_ESteamNetConnectionEnd_Local_Max = 3999,
   k_ESteamNetConnectionEnd_Remote_Min = 4000,
   k_ESteamNetConnectionEnd_Remote_Timeout = 4001,
   k_ESteamNetConnectionEnd_Remote_BadCrypt = 4002,
   k_ESteamNetConnectionEnd_Remote_BadCert = 4003,
   k_ESteamNetConnectionEnd_Remote_BadProtocolVersion = 4006,
   k_ESteamNetConnectionEnd_Remote_P2P_ICE_NoPublicAddresses = 4007,
   k_ESteamNetConnectionEnd_Remote_Max = 4999,
   k_ESteamNetConnectionEnd_Misc_Min = 5000,
   k_ESteamNetConnectionEnd_Misc_Generic = 5001,
   k_ESteamNetConnectionEnd_Misc_InternalError = 5002,
   k_ESteamNetConnectionEnd_Misc_Timeout = 5003,
   k_ESteamNetConnectionEnd_Misc_SteamConnectivity = 5005,
   k_ESteamNetConnectionEnd_Misc_NoRelaySessionsToClient = 5006,
   k_ESteamNetConnectionEnd_Misc_P2P_Rendezvous = 5008,
   k_ESteamNetConnectionEnd_Misc_P2P_NAT_Firewall = 5009,
   k_ESteamNetConnectionEnd_Misc_PeerSentNoConnection = 5010,
   k_ESteamNetConnectionEnd_Misc_Max = 5999,
   k_ESteamNetConnectionEnd__Force32Bit = 2147483647,
}
export enum ESteamNetworkingConfigScope {
   k_ESteamNetworkingConfig_Global = 1,
   k_ESteamNetworkingConfig_SocketsInterface = 2,
   k_ESteamNetworkingConfig_ListenSocket = 3,
   k_ESteamNetworkingConfig_Connection = 4,
   k_ESteamNetworkingConfigScope__Force32Bit = 2147483647,
}
export enum ESteamNetworkingConfigDataType {
   k_ESteamNetworkingConfig_Int32 = 1,
   k_ESteamNetworkingConfig_Int64 = 2,
   k_ESteamNetworkingConfig_Float = 3,
   k_ESteamNetworkingConfig_String = 4,
   k_ESteamNetworkingConfig_Ptr = 5,
   k_ESteamNetworkingConfigDataType__Force32Bit = 2147483647,
}
export enum ESteamNetworkingConfigValue {
   k_ESteamNetworkingConfig_Invalid = 0,
   k_ESteamNetworkingConfig_TimeoutInitial = 24,
   k_ESteamNetworkingConfig_TimeoutConnected = 25,
   k_ESteamNetworkingConfig_SendBufferSize = 9,
   k_ESteamNetworkingConfig_ConnectionUserData = 40,
   k_ESteamNetworkingConfig_SendRateMin = 10,
   k_ESteamNetworkingConfig_SendRateMax = 11,
   k_ESteamNetworkingConfig_NagleTime = 12,
   k_ESteamNetworkingConfig_IP_AllowWithoutAuth = 23,
   k_ESteamNetworkingConfig_MTU_PacketSize = 32,
   k_ESteamNetworkingConfig_MTU_DataSize = 33,
   k_ESteamNetworkingConfig_Unencrypted = 34,
   k_ESteamNetworkingConfig_SymmetricConnect = 37,
   k_ESteamNetworkingConfig_LocalVirtualPort = 38,
   k_ESteamNetworkingConfig_DualWifi_Enable = 39,
   k_ESteamNetworkingConfig_EnableDiagnosticsUI = 46,
   k_ESteamNetworkingConfig_FakePacketLoss_Send = 2,
   k_ESteamNetworkingConfig_FakePacketLoss_Recv = 3,
   k_ESteamNetworkingConfig_FakePacketLag_Send = 4,
   k_ESteamNetworkingConfig_FakePacketLag_Recv = 5,
   k_ESteamNetworkingConfig_FakePacketReorder_Send = 6,
   k_ESteamNetworkingConfig_FakePacketReorder_Recv = 7,
   k_ESteamNetworkingConfig_FakePacketReorder_Time = 8,
   k_ESteamNetworkingConfig_FakePacketDup_Send = 26,
   k_ESteamNetworkingConfig_FakePacketDup_Recv = 27,
   k_ESteamNetworkingConfig_FakePacketDup_TimeMax = 28,
   k_ESteamNetworkingConfig_PacketTraceMaxBytes = 41,
   k_ESteamNetworkingConfig_FakeRateLimit_Send_Rate = 42,
   k_ESteamNetworkingConfig_FakeRateLimit_Send_Burst = 43,
   k_ESteamNetworkingConfig_FakeRateLimit_Recv_Rate = 44,
   k_ESteamNetworkingConfig_FakeRateLimit_Recv_Burst = 45,
   k_ESteamNetworkingConfig_Callback_ConnectionStatusChanged = 201,
   k_ESteamNetworkingConfig_Callback_AuthStatusChanged = 202,
   k_ESteamNetworkingConfig_Callback_RelayNetworkStatusChanged = 203,
   k_ESteamNetworkingConfig_Callback_MessagesSessionRequest = 204,
   k_ESteamNetworkingConfig_Callback_MessagesSessionFailed = 205,
   k_ESteamNetworkingConfig_Callback_CreateConnectionSignaling = 206,
   k_ESteamNetworkingConfig_Callback_FakeIPResult = 207,
   k_ESteamNetworkingConfig_P2P_STUN_ServerList = 103,
   k_ESteamNetworkingConfig_P2P_Transport_ICE_Enable = 104,
   k_ESteamNetworkingConfig_P2P_Transport_ICE_Penalty = 105,
   k_ESteamNetworkingConfig_P2P_Transport_SDR_Penalty = 106,
   k_ESteamNetworkingConfig_SDRClient_ConsecutitivePingTimeoutsFailInitial = 19,
   k_ESteamNetworkingConfig_SDRClient_ConsecutitivePingTimeoutsFail = 20,
   k_ESteamNetworkingConfig_SDRClient_MinPingsBeforePingAccurate = 21,
   k_ESteamNetworkingConfig_SDRClient_SingleSocket = 22,
   k_ESteamNetworkingConfig_SDRClient_ForceRelayCluster = 29,
   k_ESteamNetworkingConfig_SDRClient_DebugTicketAddress = 30,
   k_ESteamNetworkingConfig_SDRClient_ForceProxyAddr = 31,
   k_ESteamNetworkingConfig_SDRClient_FakeClusterPing = 36,
   k_ESteamNetworkingConfig_LogLevel_AckRTT = 13,
   k_ESteamNetworkingConfig_LogLevel_PacketDecode = 14,
   k_ESteamNetworkingConfig_LogLevel_Message = 15,
   k_ESteamNetworkingConfig_LogLevel_PacketGaps = 16,
   k_ESteamNetworkingConfig_LogLevel_P2PRendezvous = 17,
   k_ESteamNetworkingConfig_LogLevel_SDRRelayPings = 18,
   k_ESteamNetworkingConfig_DELETED_EnumerateDevVars = 35,
   k_ESteamNetworkingConfigValue__Force32Bit = 2147483647,
}
export enum ESteamNetworkingGetConfigValueResult {
   k_ESteamNetworkingGetConfigValue_BadValue = -1,
   k_ESteamNetworkingGetConfigValue_BadScopeObj = -2,
   k_ESteamNetworkingGetConfigValue_BufferTooSmall = -3,
   k_ESteamNetworkingGetConfigValue_OK = 1,
   k_ESteamNetworkingGetConfigValue_OKInherited = 2,
   k_ESteamNetworkingGetConfigValueResult__Force32Bit = 2147483647,
}
export enum ESteamNetworkingSocketsDebugOutputType {
   k_ESteamNetworkingSocketsDebugOutputType_None = 0,
   k_ESteamNetworkingSocketsDebugOutputType_Bug = 1,
   k_ESteamNetworkingSocketsDebugOutputType_Error = 2,
   k_ESteamNetworkingSocketsDebugOutputType_Important = 3,
   k_ESteamNetworkingSocketsDebugOutputType_Warning = 4,
   k_ESteamNetworkingSocketsDebugOutputType_Msg = 5,
   k_ESteamNetworkingSocketsDebugOutputType_Verbose = 6,
   k_ESteamNetworkingSocketsDebugOutputType_Debug = 7,
   k_ESteamNetworkingSocketsDebugOutputType_Everything = 8,
   k_ESteamNetworkingSocketsDebugOutputType__Force32Bit = 2147483647,
}
export enum EServerMode {
   eServerModeInvalid = 0,
   eServerModeNoAuthentication = 1,
   eServerModeAuthentication = 2,
   eServerModeAuthenticationAndSecure = 3,
}
// Typedefs
koffi.alias("uint64_steamid", "uint64");
koffi.alias("uint64_gameid", "uint64");
koffi.alias("HSteamPipe", "int");
koffi.alias("HSteamUser", "int");
koffi.alias("lint64", "long long");
koffi.alias("ulint64", "unsigned long long");
koffi.alias("intp", "long long");
koffi.alias("uintp", "unsigned long long");
koffi.alias("AppId_t", "unsigned int");
koffi.alias("DepotId_t", "unsigned int");
koffi.alias("RTime32", "unsigned int");
koffi.alias("SteamAPICall_t", "unsigned long long");
koffi.alias("AccountID_t", "unsigned int");
koffi.alias("PartyBeaconID_t", "unsigned long long");
koffi.alias("HAuthTicket", "unsigned int");
koffi.alias("FriendsGroupID_t", "short");
koffi.alias("HServerListRequest", "void *");
koffi.alias("HServerQuery", "int");
koffi.alias("UGCHandle_t", "unsigned long long");
koffi.alias("PublishedFileUpdateHandle_t", "unsigned long long");
koffi.alias("PublishedFileId_t", "unsigned long long");
koffi.alias("UGCFileWriteStreamHandle_t", "unsigned long long");
koffi.alias("SteamLeaderboard_t", "unsigned long long");
koffi.alias("SteamLeaderboardEntries_t", "unsigned long long");
koffi.alias("SNetSocket_t", "unsigned int");
koffi.alias("SNetListenSocket_t", "unsigned int");
koffi.alias("ScreenshotHandle", "unsigned int");
koffi.alias("HTTPRequestHandle", "unsigned int");
koffi.alias("HTTPCookieContainerHandle", "unsigned int");
koffi.alias("InputHandle_t", "unsigned long long");
koffi.alias("InputActionSetHandle_t", "unsigned long long");
koffi.alias("InputDigitalActionHandle_t", "unsigned long long");
koffi.alias("InputAnalogActionHandle_t", "unsigned long long");
koffi.alias("ControllerHandle_t", "unsigned long long");
koffi.alias("ControllerActionSetHandle_t", "unsigned long long");
koffi.alias("ControllerDigitalActionHandle_t", "unsigned long long");
koffi.alias("ControllerAnalogActionHandle_t", "unsigned long long");
koffi.alias("UGCQueryHandle_t", "unsigned long long");
koffi.alias("UGCUpdateHandle_t", "unsigned long long");
koffi.alias("HHTMLBrowser", "unsigned int");
koffi.alias("SteamItemInstanceID_t", "unsigned long long");
koffi.alias("SteamItemDef_t", "int");
koffi.alias("SteamInventoryResult_t", "int");
koffi.alias("SteamInventoryUpdateHandle_t", "unsigned long long");
koffi.alias("RemotePlaySessionID_t", "unsigned int");
koffi.alias("HSteamNetConnection", "unsigned int");
koffi.alias("HSteamListenSocket", "unsigned int");
koffi.alias("HSteamNetPollGroup", "unsigned int");
koffi.alias("SteamNetworkingPOPID", "unsigned int");
koffi.alias("SteamNetworkingMicroseconds", "long long");
koffi.alias("ESteamIPType", "int");
koffi.alias("EUniverse", "int");
koffi.alias("EResult", "int");
koffi.alias("EVoiceResult", "int");
koffi.alias("EDenyReason", "int");
koffi.alias("EBeginAuthSessionResult", "int");
koffi.alias("EAuthSessionResponse", "int");
koffi.alias("EUserHasLicenseForAppResult", "int");
koffi.alias("EAccountType", "int");
koffi.alias("EChatEntryType", "int");
koffi.alias("EChatRoomEnterResponse", "int");
koffi.alias("EChatSteamIDInstanceFlags", "int");
koffi.alias("ENotificationPosition", "int");
koffi.alias("EBroadcastUploadResult", "int");
koffi.alias("EMarketNotAllowedReasonFlags", "int");
koffi.alias("EDurationControlProgress", "int");
koffi.alias("EDurationControlNotification", "int");
koffi.alias("EDurationControlOnlineState", "int");
koffi.alias("EGameSearchErrorCode_t", "int");
koffi.alias("EPlayerResult_t", "int");
koffi.alias("ESteamIPv6ConnectivityProtocol", "int");
koffi.alias("ESteamIPv6ConnectivityState", "int");
koffi.alias("EFriendRelationship", "int");
koffi.alias("EPersonaState", "int");
koffi.alias("EFriendFlags", "int");
koffi.alias("EUserRestriction", "int");
koffi.alias("EOverlayToStoreFlag", "int");
koffi.alias("EActivateGameOverlayToWebPageMode", "int");
koffi.alias("EPersonaChange", "int");
koffi.alias("ESteamAPICallFailure", "int");
koffi.alias("EGamepadTextInputMode", "int");
koffi.alias("EGamepadTextInputLineMode", "int");
koffi.alias("EFloatingGamepadTextInputMode", "int");
koffi.alias("ETextFilteringContext", "int");
koffi.alias("ECheckFileSignature", "int");
koffi.alias("EMatchMakingServerResponse", "int");
koffi.alias("ELobbyType", "int");
koffi.alias("ELobbyComparison", "int");
koffi.alias("ELobbyDistanceFilter", "int");
koffi.alias("EChatMemberStateChange", "int");
koffi.alias("ESteamPartyBeaconLocationType", "int");
koffi.alias("ESteamPartyBeaconLocationData", "int");
koffi.alias("ERemoteStoragePlatform", "int");
koffi.alias("ERemoteStoragePublishedFileVisibility", "int");
koffi.alias("EWorkshopFileType", "int");
koffi.alias("EWorkshopVote", "int");
koffi.alias("EWorkshopFileAction", "int");
koffi.alias("EWorkshopEnumerationType", "int");
koffi.alias("EWorkshopVideoProvider", "int");
koffi.alias("EUGCReadAction", "int");
koffi.alias("ERemoteStorageLocalFileChange", "int");
koffi.alias("ERemoteStorageFilePathType", "int");
koffi.alias("ELeaderboardDataRequest", "int");
koffi.alias("ELeaderboardSortMethod", "int");
koffi.alias("ELeaderboardDisplayType", "int");
koffi.alias("ELeaderboardUploadScoreMethod", "int");
koffi.alias("ERegisterActivationCodeResult", "int");
koffi.alias("EP2PSessionError", "int");
koffi.alias("EP2PSend", "int");
koffi.alias("ESNetSocketState", "int");
koffi.alias("ESNetSocketConnectionType", "int");
koffi.alias("EVRScreenshotType", "int");
koffi.alias("AudioPlayback_Status", "int");
koffi.alias("EHTTPMethod", "int");
koffi.alias("EHTTPStatusCode", "int");
koffi.alias("EInputSourceMode", "int");
koffi.alias("EInputActionOrigin", "int");
koffi.alias("EXboxOrigin", "int");
koffi.alias("ESteamControllerPad", "int");
koffi.alias("EControllerHapticLocation", "int");
koffi.alias("EControllerHapticType", "int");
koffi.alias("ESteamInputType", "int");
koffi.alias("ESteamInputConfigurationEnableType", "int");
koffi.alias("ESteamInputLEDFlag", "int");
koffi.alias("ESteamInputGlyphSize", "int");
koffi.alias("ESteamInputGlyphStyle", "int");
koffi.alias("ESteamInputActionEventType", "int");
koffi.alias("EControllerActionOrigin", "int");
koffi.alias("ESteamControllerLEDFlag", "int");
koffi.alias("EUGCMatchingUGCType", "int");
koffi.alias("EUserUGCList", "int");
koffi.alias("EUserUGCListSortOrder", "int");
koffi.alias("EUGCQuery", "int");
koffi.alias("EItemUpdateStatus", "int");
koffi.alias("EItemState", "int");
koffi.alias("EItemStatistic", "int");
koffi.alias("EItemPreviewType", "int");
koffi.alias("ESteamItemFlags", "int");
koffi.alias("EParentalFeature", "int");
koffi.alias("ESteamDeviceFormFactor", "int");
koffi.alias("ESteamNetworkingAvailability", "int");
koffi.alias("ESteamNetworkingIdentityType", "int");
koffi.alias("ESteamNetworkingFakeIPType", "int");
koffi.alias("ESteamNetworkingConnectionState", "int");
koffi.alias("ESteamNetConnectionEnd", "int");
koffi.alias("ESteamNetworkingConfigScope", "int");
koffi.alias("ESteamNetworkingConfigDataType", "int");
koffi.alias("ESteamNetworkingConfigValue", "int");
koffi.alias("ESteamNetworkingGetConfigValueResult", "int");
koffi.alias("ESteamNetworkingSocketsDebugOutputType", "int");
koffi.alias("EServerMode", "int");
// Consts
export const k_uAppIdInvalid = 0x0;
export const k_uDepotIdInvalid = 0x0;
export const k_uAPICallInvalid = 0x0;
export const k_ulPartyBeaconIdInvalid = 0;
export const k_HAuthTicketInvalid = 0;
export const k_unSteamAccountIDMask = 0xffffffff;
export const k_unSteamAccountInstanceMask = 0x000fffff;
export const k_unSteamUserDefaultInstance = 1;
export const k_cchGameExtraInfoMax = 64;
export const k_cchMaxFriendsGroupName = 64;
export const k_cFriendsGroupLimit = 100;
export const k_FriendsGroupID_Invalid = -1;
export const k_cEnumerateFollowersMax = 50;
export const k_cubChatMetadataMax = 8192;
export const k_cbMaxGameServerGameDir = 32;
export const k_cbMaxGameServerMapName = 32;
export const k_cbMaxGameServerGameDescription = 64;
export const k_cbMaxGameServerName = 64;
export const k_cbMaxGameServerTags = 128;
export const k_cbMaxGameServerGameData = 2048;
export const HSERVERQUERY_INVALID = 0xffffffff;
export const k_unFavoriteFlagNone = 0x00;
export const k_unFavoriteFlagFavorite = 0x01;
export const k_unFavoriteFlagHistory = 0x02;
export const k_unMaxCloudFileChunkSize = 100 * 1024 * 1024;
export const k_PublishedFileIdInvalid = 0;
export const k_UGCHandleInvalid = BigInt("0xffffffffffffffff");
export const k_PublishedFileUpdateHandleInvalid = BigInt("0xffffffffffffffff");
export const k_UGCFileStreamHandleInvalid = BigInt("0xffffffffffffffff");
export const k_cchPublishedDocumentTitleMax = 128 + 1;
export const k_cchPublishedDocumentDescriptionMax = 8000;
export const k_cchPublishedDocumentChangeDescriptionMax = 8000;
export const k_unEnumeratePublishedFilesMaxResults = 50;
export const k_cchTagListMax = 1024 + 1;
export const k_cchFilenameMax = 260;
export const k_cchPublishedFileURLMax = 256;
export const k_cubAppProofOfPurchaseKeyMax = 240;
export const k_nScreenshotMaxTaggedUsers = 32;
export const k_nScreenshotMaxTaggedPublishedFiles = 32;
export const k_cubUFSTagTypeMax = 255;
export const k_cubUFSTagValueMax = 255;
export const k_ScreenshotThumbWidth = 200;
export const k_UGCQueryHandleInvalid = BigInt("0xffffffffffffffff");
export const k_UGCUpdateHandleInvalid = BigInt("0xffffffffffffffff");
export const kNumUGCResultsPerPage = 50;
export const k_cchDeveloperMetadataMax = 5000;
export const INVALID_HTMLBROWSER = 0;
export const k_SteamInventoryResultInvalid = -1;
export const k_SteamInventoryUpdateHandleInvalid = BigInt("0xffffffffffffffff");
export const k_HSteamNetConnection_Invalid = 0;
export const k_HSteamListenSocket_Invalid = 0;
export const k_HSteamNetPollGroup_Invalid = 0;
export const k_cchMaxSteamNetworkingErrMsg = 1024;
export const k_cchSteamNetworkingMaxConnectionCloseReason = 128;
export const k_cchSteamNetworkingMaxConnectionDescription = 128;
export const k_cchSteamNetworkingMaxConnectionAppName = 32;
export const k_nSteamNetworkConnectionInfoFlags_Unauthenticated = 1;
export const k_nSteamNetworkConnectionInfoFlags_Unencrypted = 2;
export const k_nSteamNetworkConnectionInfoFlags_LoopbackBuffers = 4;
export const k_nSteamNetworkConnectionInfoFlags_Fast = 8;
export const k_nSteamNetworkConnectionInfoFlags_Relayed = 16;
export const k_nSteamNetworkConnectionInfoFlags_DualWifi = 32;
export const k_cbMaxSteamNetworkingSocketsMessageSizeSend = 512 * 1024;
export const k_nSteamNetworkingSend_Unreliable = 0;
export const k_nSteamNetworkingSend_NoNagle = 1;
export const k_nSteamNetworkingSend_UnreliableNoNagle =
   k_nSteamNetworkingSend_Unreliable | k_nSteamNetworkingSend_NoNagle;
export const k_nSteamNetworkingSend_NoDelay = 4;
export const k_nSteamNetworkingSend_UnreliableNoDelay =
   k_nSteamNetworkingSend_Unreliable | k_nSteamNetworkingSend_NoDelay | k_nSteamNetworkingSend_NoNagle;
export const k_nSteamNetworkingSend_Reliable = 8;
export const k_nSteamNetworkingSend_ReliableNoNagle = k_nSteamNetworkingSend_Reliable | k_nSteamNetworkingSend_NoNagle;
export const k_nSteamNetworkingSend_UseCurrentThread = 16;
export const k_nSteamNetworkingSend_AutoRestartBrokenSession = 32;
export const k_cchMaxSteamNetworkingPingLocationString = 1024;
export const k_nSteamNetworkingPing_Failed = -1;
export const k_nSteamNetworkingPing_Unknown = -2;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_Default = -1;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_Disable = 0;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_Relay = 1;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_Private = 2;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_Public = 4;
export const k_nSteamNetworkingConfig_P2P_Transport_ICE_Enable_All = 0x7fffffff;
export const STEAMGAMESERVER_QUERY_PORT_SHARED = 0xffff;
export const MASTERSERVERUPDATERPORT_USEGAMESOCKETSHARE = STEAMGAMESERVER_QUERY_PORT_SHARED;
export const k_cbSteamDatagramMaxSerializedTicket = 512;
export const k_cbMaxSteamDatagramGameCoordinatorServerLoginAppData = 2048;
export const k_cbMaxSteamDatagramGameCoordinatorServerLoginSerialized = 4096;
export const k_cbSteamNetworkingSocketsFakeUDPPortRecommendedMTU = 1200;
export const k_cbSteamNetworkingSocketsFakeUDPPortMaxMessageSize = 4096;
// Callbacks
export interface ICallback_SteamServerConnectFailure_t {
   m_eResult: EResult;
   m_bStillRetrying: boolean;
}
koffi.struct("SteamServerConnectFailure_t", { m_eResult: "EResult", m_bStillRetrying: "bool" });
export interface ICallback_SteamServersDisconnected_t {
   m_eResult: EResult;
}
koffi.struct("SteamServersDisconnected_t", { m_eResult: "EResult" });
export interface ICallback_ClientGameServerDeny_t {
   m_uAppID: number;
   m_unGameServerIP: number;
   m_usGameServerPort: number;
   m_bSecure: number;
   m_uReason: number;
}
koffi.struct("ClientGameServerDeny_t", {
   m_uAppID: "uint32",
   m_unGameServerIP: "uint32",
   m_usGameServerPort: "uint16",
   m_bSecure: "uint16",
   m_uReason: "uint32",
});
export interface ICallback_IPCFailure_t {
   m_eFailureType: number;
}
koffi.struct("IPCFailure_t", { m_eFailureType: "uint8" });
export interface ICallback_MicroTxnAuthorizationResponse_t {
   m_unAppID: number;
   m_ulOrderID: number;
   m_bAuthorized: number;
}
koffi.struct("MicroTxnAuthorizationResponse_t", { m_unAppID: "uint32", m_ulOrderID: "uint64", m_bAuthorized: "uint8" });
export interface ICallback_EncryptedAppTicketResponse_t {
   m_eResult: EResult;
}
koffi.struct("EncryptedAppTicketResponse_t", { m_eResult: "EResult" });
export interface ICallback_GetAuthSessionTicketResponse_t {
   m_hAuthTicket: number;
   m_eResult: EResult;
}
koffi.struct("GetAuthSessionTicketResponse_t", { m_hAuthTicket: "HAuthTicket", m_eResult: "EResult" });
export interface ICallback_MarketEligibilityResponse_t {
   m_bAllowed: boolean;
   m_eNotAllowedReason: EMarketNotAllowedReasonFlags;
   m_rtAllowedAtTime: number;
   m_cdaySteamGuardRequiredDays: number;
   m_cdayNewDeviceCooldown: number;
}
koffi.struct("MarketEligibilityResponse_t", {
   m_bAllowed: "bool",
   m_eNotAllowedReason: "EMarketNotAllowedReasonFlags",
   m_rtAllowedAtTime: "RTime32",
   m_cdaySteamGuardRequiredDays: "int",
   m_cdayNewDeviceCooldown: "int",
});
export interface ICallback_DurationControl_t {
   m_eResult: EResult;
   m_appid: number;
   m_bApplicable: boolean;
   m_csecsLast5h: number;
   m_progress: EDurationControlProgress;
   m_notification: EDurationControlNotification;
   m_csecsToday: number;
   m_csecsRemaining: number;
}
koffi.struct("DurationControl_t", {
   m_eResult: "EResult",
   m_appid: "AppId_t",
   m_bApplicable: "bool",
   m_csecsLast5h: "int32",
   m_progress: "EDurationControlProgress",
   m_notification: "EDurationControlNotification",
   m_csecsToday: "int32",
   m_csecsRemaining: "int32",
});
export interface ICallback_PersonaStateChange_t {
   m_ulSteamID: number;
   m_nChangeFlags: number;
}
koffi.struct("PersonaStateChange_t", { m_ulSteamID: "uint64", m_nChangeFlags: "int" });
export interface ICallback_GameOverlayActivated_t {
   m_bActive: number;
}
koffi.struct("GameOverlayActivated_t", { m_bActive: "uint8" });
export interface ICallback_DownloadClanActivityCountsResult_t {
   m_bSuccess: boolean;
}
koffi.struct("DownloadClanActivityCountsResult_t", { m_bSuccess: "bool" });
export interface ICallback_SetPersonaNameResponse_t {
   m_bSuccess: boolean;
   m_bLocalSuccess: boolean;
   m_result: EResult;
}
koffi.struct("SetPersonaNameResponse_t", { m_bSuccess: "bool", m_bLocalSuccess: "bool", m_result: "EResult" });
export interface ICallback_LowBatteryPower_t {
   m_nMinutesBatteryLeft: number;
}
koffi.struct("LowBatteryPower_t", { m_nMinutesBatteryLeft: "uint8" });
export interface ICallback_SteamAPICallCompleted_t {
   m_hAsyncCall: number;
   m_iCallback: number;
   m_cubParam: number;
}
koffi.struct("SteamAPICallCompleted_t", { m_hAsyncCall: "SteamAPICall_t", m_iCallback: "int", m_cubParam: "uint32" });
export interface ICallback_CheckFileSignature_t {
   m_eCheckFileSignature: ECheckFileSignature;
}
koffi.struct("CheckFileSignature_t", { m_eCheckFileSignature: "ECheckFileSignature" });
export interface ICallback_GamepadTextInputDismissed_t {
   m_bSubmitted: boolean;
   m_unSubmittedText: number;
}
koffi.struct("GamepadTextInputDismissed_t", { m_bSubmitted: "bool", m_unSubmittedText: "uint32" });
export interface ICallback_FavoritesListChanged_t {
   m_nIP: number;
   m_nQueryPort: number;
   m_nConnPort: number;
   m_nAppID: number;
   m_nFlags: number;
   m_bAdd: boolean;
   m_unAccountId: number;
}
koffi.struct("FavoritesListChanged_t", {
   m_nIP: "uint32",
   m_nQueryPort: "uint32",
   m_nConnPort: "uint32",
   m_nAppID: "uint32",
   m_nFlags: "uint32",
   m_bAdd: "bool",
   m_unAccountId: "AccountID_t",
});
export interface ICallback_LobbyInvite_t {
   m_ulSteamIDUser: number;
   m_ulSteamIDLobby: number;
   m_ulGameID: number;
}
koffi.struct("LobbyInvite_t", { m_ulSteamIDUser: "uint64", m_ulSteamIDLobby: "uint64", m_ulGameID: "uint64" });
export interface ICallback_LobbyEnter_t {
   m_ulSteamIDLobby: number;
   m_rgfChatPermissions: number;
   m_bLocked: boolean;
   m_EChatRoomEnterResponse: number;
}
koffi.struct("LobbyEnter_t", {
   m_ulSteamIDLobby: "uint64",
   m_rgfChatPermissions: "uint32",
   m_bLocked: "bool",
   m_EChatRoomEnterResponse: "uint32",
});
export interface ICallback_LobbyDataUpdate_t {
   m_ulSteamIDLobby: number;
   m_ulSteamIDMember: number;
   m_bSuccess: number;
}
koffi.struct("LobbyDataUpdate_t", { m_ulSteamIDLobby: "uint64", m_ulSteamIDMember: "uint64", m_bSuccess: "uint8" });
export interface ICallback_LobbyChatUpdate_t {
   m_ulSteamIDLobby: number;
   m_ulSteamIDUserChanged: number;
   m_ulSteamIDMakingChange: number;
   m_rgfChatMemberStateChange: number;
}
koffi.struct("LobbyChatUpdate_t", {
   m_ulSteamIDLobby: "uint64",
   m_ulSteamIDUserChanged: "uint64",
   m_ulSteamIDMakingChange: "uint64",
   m_rgfChatMemberStateChange: "uint32",
});
export interface ICallback_LobbyChatMsg_t {
   m_ulSteamIDLobby: number;
   m_ulSteamIDUser: number;
   m_eChatEntryType: number;
   m_iChatID: number;
}
koffi.struct("LobbyChatMsg_t", {
   m_ulSteamIDLobby: "uint64",
   m_ulSteamIDUser: "uint64",
   m_eChatEntryType: "uint8",
   m_iChatID: "uint32",
});
export interface ICallback_LobbyGameCreated_t {
   m_ulSteamIDLobby: number;
   m_ulSteamIDGameServer: number;
   m_unIP: number;
   m_usPort: number;
}
koffi.struct("LobbyGameCreated_t", {
   m_ulSteamIDLobby: "uint64",
   m_ulSteamIDGameServer: "uint64",
   m_unIP: "uint32",
   m_usPort: "uint16",
});
export interface ICallback_LobbyMatchList_t {
   m_nLobbiesMatching: number;
}
koffi.struct("LobbyMatchList_t", { m_nLobbiesMatching: "uint32" });
export interface ICallback_LobbyKicked_t {
   m_ulSteamIDLobby: number;
   m_ulSteamIDAdmin: number;
   m_bKickedDueToDisconnect: number;
}
koffi.struct("LobbyKicked_t", {
   m_ulSteamIDLobby: "uint64",
   m_ulSteamIDAdmin: "uint64",
   m_bKickedDueToDisconnect: "uint8",
});
export interface ICallback_LobbyCreated_t {
   m_eResult: EResult;
   m_ulSteamIDLobby: number;
}
koffi.struct("LobbyCreated_t", { m_eResult: "EResult", m_ulSteamIDLobby: "uint64" });
export interface ICallback_FavoritesListAccountsUpdated_t {
   m_eResult: EResult;
}
koffi.struct("FavoritesListAccountsUpdated_t", { m_eResult: "EResult" });
export interface ICallback_RequestPlayersForGameProgressCallback_t {
   m_eResult: EResult;
   m_ullSearchID: number;
}
koffi.struct("RequestPlayersForGameProgressCallback_t", { m_eResult: "EResult", m_ullSearchID: "uint64" });
export interface ICallback_RequestPlayersForGameFinalResultCallback_t {
   m_eResult: EResult;
   m_ullSearchID: number;
   m_ullUniqueGameID: number;
}
koffi.struct("RequestPlayersForGameFinalResultCallback_t", {
   m_eResult: "EResult",
   m_ullSearchID: "uint64",
   m_ullUniqueGameID: "uint64",
});
export interface ICallback_EndGameResultCallback_t {
   m_eResult: EResult;
   ullUniqueGameID: number;
}
koffi.struct("EndGameResultCallback_t", { m_eResult: "EResult", ullUniqueGameID: "uint64" });
export interface ICallback_CreateBeaconCallback_t {
   m_eResult: EResult;
   m_ulBeaconID: number;
}
koffi.struct("CreateBeaconCallback_t", { m_eResult: "EResult", m_ulBeaconID: "PartyBeaconID_t" });
export interface ICallback_ChangeNumOpenSlotsCallback_t {
   m_eResult: EResult;
}
koffi.struct("ChangeNumOpenSlotsCallback_t", { m_eResult: "EResult" });
export interface ICallback_RemoteStoragePublishFileResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_bUserNeedsToAcceptWorkshopLegalAgreement: boolean;
}
koffi.struct("RemoteStoragePublishFileResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_bUserNeedsToAcceptWorkshopLegalAgreement: "bool",
});
export interface ICallback_RemoteStorageDeletePublishedFileResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
}
koffi.struct("RemoteStorageDeletePublishedFileResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_RemoteStorageSubscribePublishedFileResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
}
koffi.struct("RemoteStorageSubscribePublishedFileResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_RemoteStorageUnsubscribePublishedFileResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
}
koffi.struct("RemoteStorageUnsubscribePublishedFileResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_RemoteStorageUpdatePublishedFileResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_bUserNeedsToAcceptWorkshopLegalAgreement: boolean;
}
koffi.struct("RemoteStorageUpdatePublishedFileResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_bUserNeedsToAcceptWorkshopLegalAgreement: "bool",
});
export interface ICallback_RemoteStorageGetPublishedItemVoteDetailsResult_t {
   m_eResult: EResult;
   m_unPublishedFileId: number;
   m_nVotesFor: number;
   m_nVotesAgainst: number;
   m_nReports: number;
   m_fScore: number;
}
koffi.struct("RemoteStorageGetPublishedItemVoteDetailsResult_t", {
   m_eResult: "EResult",
   m_unPublishedFileId: "PublishedFileId_t",
   m_nVotesFor: "int32",
   m_nVotesAgainst: "int32",
   m_nReports: "int32",
   m_fScore: "float",
});
export interface ICallback_RemoteStoragePublishedFileSubscribed_t {
   m_nPublishedFileId: number;
   m_nAppID: number;
}
koffi.struct("RemoteStoragePublishedFileSubscribed_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_nAppID: "AppId_t",
});
export interface ICallback_RemoteStoragePublishedFileUnsubscribed_t {
   m_nPublishedFileId: number;
   m_nAppID: number;
}
koffi.struct("RemoteStoragePublishedFileUnsubscribed_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_nAppID: "AppId_t",
});
export interface ICallback_RemoteStoragePublishedFileDeleted_t {
   m_nPublishedFileId: number;
   m_nAppID: number;
}
koffi.struct("RemoteStoragePublishedFileDeleted_t", { m_nPublishedFileId: "PublishedFileId_t", m_nAppID: "AppId_t" });
export interface ICallback_RemoteStorageUpdateUserPublishedItemVoteResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
}
koffi.struct("RemoteStorageUpdateUserPublishedItemVoteResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_RemoteStorageUserVoteDetails_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_eVote: EWorkshopVote;
}
koffi.struct("RemoteStorageUserVoteDetails_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_eVote: "EWorkshopVote",
});
export interface ICallback_RemoteStorageSetUserPublishedFileActionResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_eAction: EWorkshopFileAction;
}
koffi.struct("RemoteStorageSetUserPublishedFileActionResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_eAction: "EWorkshopFileAction",
});
export interface ICallback_RemoteStoragePublishFileProgress_t {
   m_dPercentFile: number;
   m_bPreview: boolean;
}
koffi.struct("RemoteStoragePublishFileProgress_t", { m_dPercentFile: "double", m_bPreview: "bool" });
export interface ICallback_RemoteStoragePublishedFileUpdated_t {
   m_nPublishedFileId: number;
   m_nAppID: number;
   m_ulUnused: number;
}
koffi.struct("RemoteStoragePublishedFileUpdated_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_nAppID: "AppId_t",
   m_ulUnused: "uint64",
});
export interface ICallback_RemoteStorageFileWriteAsyncComplete_t {
   m_eResult: EResult;
}
koffi.struct("RemoteStorageFileWriteAsyncComplete_t", { m_eResult: "EResult" });
export interface ICallback_RemoteStorageFileReadAsyncComplete_t {
   m_hFileReadAsync: number;
   m_eResult: EResult;
   m_nOffset: number;
   m_cubRead: number;
}
koffi.struct("RemoteStorageFileReadAsyncComplete_t", {
   m_hFileReadAsync: "SteamAPICall_t",
   m_eResult: "EResult",
   m_nOffset: "uint32",
   m_cubRead: "uint32",
});
export interface ICallback_UserStatsStored_t {
   m_nGameID: number;
   m_eResult: EResult;
}
koffi.struct("UserStatsStored_t", { m_nGameID: "uint64", m_eResult: "EResult" });
export interface ICallback_LeaderboardFindResult_t {
   m_hSteamLeaderboard: number;
   m_bLeaderboardFound: number;
}
koffi.struct("LeaderboardFindResult_t", { m_hSteamLeaderboard: "SteamLeaderboard_t", m_bLeaderboardFound: "uint8" });
export interface ICallback_LeaderboardScoresDownloaded_t {
   m_hSteamLeaderboard: number;
   m_hSteamLeaderboardEntries: number;
   m_cEntryCount: number;
}
koffi.struct("LeaderboardScoresDownloaded_t", {
   m_hSteamLeaderboard: "SteamLeaderboard_t",
   m_hSteamLeaderboardEntries: "SteamLeaderboardEntries_t",
   m_cEntryCount: "int",
});
export interface ICallback_LeaderboardScoreUploaded_t {
   m_bSuccess: number;
   m_hSteamLeaderboard: number;
   m_nScore: number;
   m_bScoreChanged: number;
   m_nGlobalRankNew: number;
   m_nGlobalRankPrevious: number;
}
koffi.struct("LeaderboardScoreUploaded_t", {
   m_bSuccess: "uint8",
   m_hSteamLeaderboard: "SteamLeaderboard_t",
   m_nScore: "int32",
   m_bScoreChanged: "uint8",
   m_nGlobalRankNew: "int",
   m_nGlobalRankPrevious: "int",
});
export interface ICallback_NumberOfCurrentPlayers_t {
   m_bSuccess: number;
   m_cPlayers: number;
}
koffi.struct("NumberOfCurrentPlayers_t", { m_bSuccess: "uint8", m_cPlayers: "int32" });
export interface ICallback_GlobalAchievementPercentagesReady_t {
   m_nGameID: number;
   m_eResult: EResult;
}
koffi.struct("GlobalAchievementPercentagesReady_t", { m_nGameID: "uint64", m_eResult: "EResult" });
export interface ICallback_LeaderboardUGCSet_t {
   m_eResult: EResult;
   m_hSteamLeaderboard: number;
}
koffi.struct("LeaderboardUGCSet_t", { m_eResult: "EResult", m_hSteamLeaderboard: "SteamLeaderboard_t" });
export interface ICallback_PS3TrophiesInstalled_t {
   m_nGameID: number;
   m_eResult: EResult;
   m_ulRequiredDiskSpace: number;
}
koffi.struct("PS3TrophiesInstalled_t", { m_nGameID: "uint64", m_eResult: "EResult", m_ulRequiredDiskSpace: "uint64" });
export interface ICallback_GlobalStatsReceived_t {
   m_nGameID: number;
   m_eResult: EResult;
}
koffi.struct("GlobalStatsReceived_t", { m_nGameID: "uint64", m_eResult: "EResult" });
export interface ICallback_DlcInstalled_t {
   m_nAppID: number;
}
koffi.struct("DlcInstalled_t", { m_nAppID: "AppId_t" });
export interface ICallback_RegisterActivationCodeResponse_t {
   m_eResult: ERegisterActivationCodeResult;
   m_unPackageRegistered: number;
}
koffi.struct("RegisterActivationCodeResponse_t", {
   m_eResult: "ERegisterActivationCodeResult",
   m_unPackageRegistered: "uint32",
});
export interface ICallback_TimedTrialStatus_t {
   m_unAppID: number;
   m_bIsOffline: boolean;
   m_unSecondsAllowed: number;
   m_unSecondsPlayed: number;
}
koffi.struct("TimedTrialStatus_t", {
   m_unAppID: "AppId_t",
   m_bIsOffline: "bool",
   m_unSecondsAllowed: "uint32",
   m_unSecondsPlayed: "uint32",
});
export interface ICallback_ScreenshotReady_t {
   m_hLocal: number;
   m_eResult: EResult;
}
koffi.struct("ScreenshotReady_t", { m_hLocal: "ScreenshotHandle", m_eResult: "EResult" });
export interface ICallback_VolumeHasChanged_t {
   m_flNewVolume: number;
}
koffi.struct("VolumeHasChanged_t", { m_flNewVolume: "float" });
export interface ICallback_MusicPlayerWantsShuffled_t {
   m_bShuffled: boolean;
}
koffi.struct("MusicPlayerWantsShuffled_t", { m_bShuffled: "bool" });
export interface ICallback_MusicPlayerWantsLooped_t {
   m_bLooped: boolean;
}
koffi.struct("MusicPlayerWantsLooped_t", { m_bLooped: "bool" });
export interface ICallback_MusicPlayerWantsVolume_t {
   m_flNewVolume: number;
}
koffi.struct("MusicPlayerWantsVolume_t", { m_flNewVolume: "float" });
export interface ICallback_MusicPlayerSelectsQueueEntry_t {
   nID: number;
}
koffi.struct("MusicPlayerSelectsQueueEntry_t", { nID: "int" });
export interface ICallback_MusicPlayerSelectsPlaylistEntry_t {
   nID: number;
}
koffi.struct("MusicPlayerSelectsPlaylistEntry_t", { nID: "int" });
export interface ICallback_MusicPlayerWantsPlayingRepeatStatus_t {
   m_nPlayingRepeatStatus: number;
}
koffi.struct("MusicPlayerWantsPlayingRepeatStatus_t", { m_nPlayingRepeatStatus: "int" });
export interface ICallback_HTTPRequestCompleted_t {
   m_hRequest: number;
   m_ulContextValue: number;
   m_bRequestSuccessful: boolean;
   m_eStatusCode: EHTTPStatusCode;
   m_unBodySize: number;
}
koffi.struct("HTTPRequestCompleted_t", {
   m_hRequest: "HTTPRequestHandle",
   m_ulContextValue: "uint64",
   m_bRequestSuccessful: "bool",
   m_eStatusCode: "EHTTPStatusCode",
   m_unBodySize: "uint32",
});
export interface ICallback_HTTPRequestHeadersReceived_t {
   m_hRequest: number;
   m_ulContextValue: number;
}
koffi.struct("HTTPRequestHeadersReceived_t", { m_hRequest: "HTTPRequestHandle", m_ulContextValue: "uint64" });
export interface ICallback_HTTPRequestDataReceived_t {
   m_hRequest: number;
   m_ulContextValue: number;
   m_cOffset: number;
   m_cBytesReceived: number;
}
koffi.struct("HTTPRequestDataReceived_t", {
   m_hRequest: "HTTPRequestHandle",
   m_ulContextValue: "uint64",
   m_cOffset: "uint32",
   m_cBytesReceived: "uint32",
});
export interface ICallback_SteamInputDeviceConnected_t {
   m_ulConnectedDeviceHandle: number;
}
koffi.struct("SteamInputDeviceConnected_t", { m_ulConnectedDeviceHandle: "InputHandle_t" });
export interface ICallback_SteamInputDeviceDisconnected_t {
   m_ulDisconnectedDeviceHandle: number;
}
koffi.struct("SteamInputDeviceDisconnected_t", { m_ulDisconnectedDeviceHandle: "InputHandle_t" });
export interface ICallback_CreateItemResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_bUserNeedsToAcceptWorkshopLegalAgreement: boolean;
}
koffi.struct("CreateItemResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_bUserNeedsToAcceptWorkshopLegalAgreement: "bool",
});
export interface ICallback_SubmitItemUpdateResult_t {
   m_eResult: EResult;
   m_bUserNeedsToAcceptWorkshopLegalAgreement: boolean;
   m_nPublishedFileId: number;
}
koffi.struct("SubmitItemUpdateResult_t", {
   m_eResult: "EResult",
   m_bUserNeedsToAcceptWorkshopLegalAgreement: "bool",
   m_nPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_ItemInstalled_t {
   m_unAppID: number;
   m_nPublishedFileId: number;
}
koffi.struct("ItemInstalled_t", { m_unAppID: "AppId_t", m_nPublishedFileId: "PublishedFileId_t" });
export interface ICallback_DownloadItemResult_t {
   m_unAppID: number;
   m_nPublishedFileId: number;
   m_eResult: EResult;
}
koffi.struct("DownloadItemResult_t", {
   m_unAppID: "AppId_t",
   m_nPublishedFileId: "PublishedFileId_t",
   m_eResult: "EResult",
});
export interface ICallback_UserFavoriteItemsListChanged_t {
   m_nPublishedFileId: number;
   m_eResult: EResult;
   m_bWasAddRequest: boolean;
}
koffi.struct("UserFavoriteItemsListChanged_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_eResult: "EResult",
   m_bWasAddRequest: "bool",
});
export interface ICallback_SetUserItemVoteResult_t {
   m_nPublishedFileId: number;
   m_eResult: EResult;
   m_bVoteUp: boolean;
}
koffi.struct("SetUserItemVoteResult_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_eResult: "EResult",
   m_bVoteUp: "bool",
});
export interface ICallback_GetUserItemVoteResult_t {
   m_nPublishedFileId: number;
   m_eResult: EResult;
   m_bVotedUp: boolean;
   m_bVotedDown: boolean;
   m_bVoteSkipped: boolean;
}
koffi.struct("GetUserItemVoteResult_t", {
   m_nPublishedFileId: "PublishedFileId_t",
   m_eResult: "EResult",
   m_bVotedUp: "bool",
   m_bVotedDown: "bool",
   m_bVoteSkipped: "bool",
});
export interface ICallback_StartPlaytimeTrackingResult_t {
   m_eResult: EResult;
}
koffi.struct("StartPlaytimeTrackingResult_t", { m_eResult: "EResult" });
export interface ICallback_StopPlaytimeTrackingResult_t {
   m_eResult: EResult;
}
koffi.struct("StopPlaytimeTrackingResult_t", { m_eResult: "EResult" });
export interface ICallback_AddUGCDependencyResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_nChildPublishedFileId: number;
}
koffi.struct("AddUGCDependencyResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_nChildPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_RemoveUGCDependencyResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_nChildPublishedFileId: number;
}
koffi.struct("RemoveUGCDependencyResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_nChildPublishedFileId: "PublishedFileId_t",
});
export interface ICallback_AddAppDependencyResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_nAppID: number;
}
koffi.struct("AddAppDependencyResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_nAppID: "AppId_t",
});
export interface ICallback_RemoveAppDependencyResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
   m_nAppID: number;
}
koffi.struct("RemoveAppDependencyResult_t", {
   m_eResult: "EResult",
   m_nPublishedFileId: "PublishedFileId_t",
   m_nAppID: "AppId_t",
});
export interface ICallback_DeleteItemResult_t {
   m_eResult: EResult;
   m_nPublishedFileId: number;
}
koffi.struct("DeleteItemResult_t", { m_eResult: "EResult", m_nPublishedFileId: "PublishedFileId_t" });
export interface ICallback_UserSubscribedItemsListChanged_t {
   m_nAppID: number;
}
koffi.struct("UserSubscribedItemsListChanged_t", { m_nAppID: "AppId_t" });
export interface ICallback_WorkshopEULAStatus_t {
   m_eResult: EResult;
   m_nAppID: number;
   m_unVersion: number;
   m_rtAction: number;
   m_bAccepted: boolean;
   m_bNeedsAction: boolean;
}
koffi.struct("WorkshopEULAStatus_t", {
   m_eResult: "EResult",
   m_nAppID: "AppId_t",
   m_unVersion: "uint32",
   m_rtAction: "RTime32",
   m_bAccepted: "bool",
   m_bNeedsAction: "bool",
});
export interface ICallback_SteamAppInstalled_t {
   m_nAppID: number;
   m_iInstallFolderIndex: number;
}
koffi.struct("SteamAppInstalled_t", { m_nAppID: "AppId_t", m_iInstallFolderIndex: "int" });
export interface ICallback_SteamAppUninstalled_t {
   m_nAppID: number;
   m_iInstallFolderIndex: number;
}
koffi.struct("SteamAppUninstalled_t", { m_nAppID: "AppId_t", m_iInstallFolderIndex: "int" });
export interface ICallback_HTML_BrowserReady_t {
   unBrowserHandle: number;
}
koffi.struct("HTML_BrowserReady_t", { unBrowserHandle: "HHTMLBrowser" });
export interface ICallback_HTML_NeedsPaint_t {
   unBrowserHandle: number;
   pBGRA: string;
   unWide: number;
   unTall: number;
   unUpdateX: number;
   unUpdateY: number;
   unUpdateWide: number;
   unUpdateTall: number;
   unScrollX: number;
   unScrollY: number;
   flPageScale: number;
   unPageSerial: number;
}
koffi.struct("HTML_NeedsPaint_t", {
   unBrowserHandle: "HHTMLBrowser",
   pBGRA: "const char *",
   unWide: "uint32",
   unTall: "uint32",
   unUpdateX: "uint32",
   unUpdateY: "uint32",
   unUpdateWide: "uint32",
   unUpdateTall: "uint32",
   unScrollX: "uint32",
   unScrollY: "uint32",
   flPageScale: "float",
   unPageSerial: "uint32",
});
export interface ICallback_HTML_StartRequest_t {
   unBrowserHandle: number;
   pchURL: string;
   pchTarget: string;
   pchPostData: string;
   bIsRedirect: boolean;
}
koffi.struct("HTML_StartRequest_t", {
   unBrowserHandle: "HHTMLBrowser",
   pchURL: "const char *",
   pchTarget: "const char *",
   pchPostData: "const char *",
   bIsRedirect: "bool",
});
export interface ICallback_HTML_CloseBrowser_t {
   unBrowserHandle: number;
}
koffi.struct("HTML_CloseBrowser_t", { unBrowserHandle: "HHTMLBrowser" });
export interface ICallback_HTML_URLChanged_t {
   unBrowserHandle: number;
   pchURL: string;
   pchPostData: string;
   bIsRedirect: boolean;
   pchPageTitle: string;
   bNewNavigation: boolean;
}
koffi.struct("HTML_URLChanged_t", {
   unBrowserHandle: "HHTMLBrowser",
   pchURL: "const char *",
   pchPostData: "const char *",
   bIsRedirect: "bool",
   pchPageTitle: "const char *",
   bNewNavigation: "bool",
});
export interface ICallback_HTML_FinishedRequest_t {
   unBrowserHandle: number;
   pchURL: string;
   pchPageTitle: string;
}
koffi.struct("HTML_FinishedRequest_t", {
   unBrowserHandle: "HHTMLBrowser",
   pchURL: "const char *",
   pchPageTitle: "const char *",
});
export interface ICallback_HTML_OpenLinkInNewTab_t {
   unBrowserHandle: number;
   pchURL: string;
}
koffi.struct("HTML_OpenLinkInNewTab_t", { unBrowserHandle: "HHTMLBrowser", pchURL: "const char *" });
export interface ICallback_HTML_ChangedTitle_t {
   unBrowserHandle: number;
   pchTitle: string;
}
koffi.struct("HTML_ChangedTitle_t", { unBrowserHandle: "HHTMLBrowser", pchTitle: "const char *" });
export interface ICallback_HTML_SearchResults_t {
   unBrowserHandle: number;
   unResults: number;
   unCurrentMatch: number;
}
koffi.struct("HTML_SearchResults_t", {
   unBrowserHandle: "HHTMLBrowser",
   unResults: "uint32",
   unCurrentMatch: "uint32",
});
export interface ICallback_HTML_CanGoBackAndForward_t {
   unBrowserHandle: number;
   bCanGoBack: boolean;
   bCanGoForward: boolean;
}
koffi.struct("HTML_CanGoBackAndForward_t", {
   unBrowserHandle: "HHTMLBrowser",
   bCanGoBack: "bool",
   bCanGoForward: "bool",
});
export interface ICallback_HTML_HorizontalScroll_t {
   unBrowserHandle: number;
   unScrollMax: number;
   unScrollCurrent: number;
   flPageScale: number;
   bVisible: boolean;
   unPageSize: number;
}
koffi.struct("HTML_HorizontalScroll_t", {
   unBrowserHandle: "HHTMLBrowser",
   unScrollMax: "uint32",
   unScrollCurrent: "uint32",
   flPageScale: "float",
   bVisible: "bool",
   unPageSize: "uint32",
});
export interface ICallback_HTML_VerticalScroll_t {
   unBrowserHandle: number;
   unScrollMax: number;
   unScrollCurrent: number;
   flPageScale: number;
   bVisible: boolean;
   unPageSize: number;
}
koffi.struct("HTML_VerticalScroll_t", {
   unBrowserHandle: "HHTMLBrowser",
   unScrollMax: "uint32",
   unScrollCurrent: "uint32",
   flPageScale: "float",
   bVisible: "bool",
   unPageSize: "uint32",
});
export interface ICallback_HTML_LinkAtPosition_t {
   unBrowserHandle: number;
   x: number;
   y: number;
   pchURL: string;
   bInput: boolean;
   bLiveLink: boolean;
}
koffi.struct("HTML_LinkAtPosition_t", {
   unBrowserHandle: "HHTMLBrowser",
   x: "uint32",
   y: "uint32",
   pchURL: "const char *",
   bInput: "bool",
   bLiveLink: "bool",
});
export interface ICallback_HTML_JSAlert_t {
   unBrowserHandle: number;
   pchMessage: string;
}
koffi.struct("HTML_JSAlert_t", { unBrowserHandle: "HHTMLBrowser", pchMessage: "const char *" });
export interface ICallback_HTML_JSConfirm_t {
   unBrowserHandle: number;
   pchMessage: string;
}
koffi.struct("HTML_JSConfirm_t", { unBrowserHandle: "HHTMLBrowser", pchMessage: "const char *" });
export interface ICallback_HTML_FileOpenDialog_t {
   unBrowserHandle: number;
   pchTitle: string;
   pchInitialFile: string;
}
koffi.struct("HTML_FileOpenDialog_t", {
   unBrowserHandle: "HHTMLBrowser",
   pchTitle: "const char *",
   pchInitialFile: "const char *",
});
export interface ICallback_HTML_NewWindow_t {
   unBrowserHandle: number;
   pchURL: string;
   unX: number;
   unY: number;
   unWide: number;
   unTall: number;
   unNewWindow_BrowserHandle_IGNORE: number;
}
koffi.struct("HTML_NewWindow_t", {
   unBrowserHandle: "HHTMLBrowser",
   pchURL: "const char *",
   unX: "uint32",
   unY: "uint32",
   unWide: "uint32",
   unTall: "uint32",
   unNewWindow_BrowserHandle_IGNORE: "HHTMLBrowser",
});
export interface ICallback_HTML_SetCursor_t {
   unBrowserHandle: number;
   eMouseCursor: number;
}
koffi.struct("HTML_SetCursor_t", { unBrowserHandle: "HHTMLBrowser", eMouseCursor: "uint32" });
export interface ICallback_HTML_StatusText_t {
   unBrowserHandle: number;
   pchMsg: string;
}
koffi.struct("HTML_StatusText_t", { unBrowserHandle: "HHTMLBrowser", pchMsg: "const char *" });
export interface ICallback_HTML_ShowToolTip_t {
   unBrowserHandle: number;
   pchMsg: string;
}
koffi.struct("HTML_ShowToolTip_t", { unBrowserHandle: "HHTMLBrowser", pchMsg: "const char *" });
export interface ICallback_HTML_UpdateToolTip_t {
   unBrowserHandle: number;
   pchMsg: string;
}
koffi.struct("HTML_UpdateToolTip_t", { unBrowserHandle: "HHTMLBrowser", pchMsg: "const char *" });
export interface ICallback_HTML_HideToolTip_t {
   unBrowserHandle: number;
}
koffi.struct("HTML_HideToolTip_t", { unBrowserHandle: "HHTMLBrowser" });
export interface ICallback_HTML_BrowserRestarted_t {
   unBrowserHandle: number;
   unOldBrowserHandle: number;
}
koffi.struct("HTML_BrowserRestarted_t", { unBrowserHandle: "HHTMLBrowser", unOldBrowserHandle: "HHTMLBrowser" });
export interface ICallback_SteamInventoryResultReady_t {
   m_handle: number;
   m_result: EResult;
}
koffi.struct("SteamInventoryResultReady_t", { m_handle: "SteamInventoryResult_t", m_result: "EResult" });
export interface ICallback_SteamInventoryFullUpdate_t {
   m_handle: number;
}
koffi.struct("SteamInventoryFullUpdate_t", { m_handle: "SteamInventoryResult_t" });
export interface ICallback_SteamInventoryStartPurchaseResult_t {
   m_result: EResult;
   m_ulOrderID: number;
   m_ulTransID: number;
}
koffi.struct("SteamInventoryStartPurchaseResult_t", {
   m_result: "EResult",
   m_ulOrderID: "uint64",
   m_ulTransID: "uint64",
});
export interface ICallback_GetOPFSettingsResult_t {
   m_eResult: EResult;
   m_unVideoAppID: number;
}
koffi.struct("GetOPFSettingsResult_t", { m_eResult: "EResult", m_unVideoAppID: "AppId_t" });
export interface ICallback_SteamRemotePlaySessionConnected_t {
   m_unSessionID: number;
}
koffi.struct("SteamRemotePlaySessionConnected_t", { m_unSessionID: "RemotePlaySessionID_t" });
export interface ICallback_SteamRemotePlaySessionDisconnected_t {
   m_unSessionID: number;
}
koffi.struct("SteamRemotePlaySessionDisconnected_t", { m_unSessionID: "RemotePlaySessionID_t" });
export interface ICallback_GSPolicyResponse_t {
   m_bSecure: number;
}
koffi.struct("GSPolicyResponse_t", { m_bSecure: "uint8" });
export interface ICallback_GSGameplayStats_t {
   m_eResult: EResult;
   m_nRank: number;
   m_unTotalConnects: number;
   m_unTotalMinutesPlayed: number;
}
koffi.struct("GSGameplayStats_t", {
   m_eResult: "EResult",
   m_nRank: "int32",
   m_unTotalConnects: "uint32",
   m_unTotalMinutesPlayed: "uint32",
});
export interface ICallback_GSReputation_t {
   m_eResult: EResult;
   m_unReputationScore: number;
   m_bBanned: boolean;
   m_unBannedIP: number;
   m_usBannedPort: number;
   m_ulBannedGameID: number;
   m_unBanExpires: number;
}
koffi.struct("GSReputation_t", {
   m_eResult: "EResult",
   m_unReputationScore: "uint32",
   m_bBanned: "bool",
   m_unBannedIP: "uint32",
   m_usBannedPort: "uint16",
   m_ulBannedGameID: "uint64",
   m_unBanExpires: "uint32",
});
export interface ICallback_AssociateWithClanResult_t {
   m_eResult: EResult;
}
koffi.struct("AssociateWithClanResult_t", { m_eResult: "EResult" });
export const k_nMaxReturnPorts = 8;
export const CallbackIdToStruct = {
   101: "SteamServersConnected_t",
   102: "SteamServerConnectFailure_t",
   103: "SteamServersDisconnected_t",
   113: "ClientGameServerDeny_t",
   115: "GSPolicyResponse_t",
   117: "IPCFailure_t",
   125: "LicensesUpdated_t",
   152: "MicroTxnAuthorizationResponse_t",
   154: "EncryptedAppTicketResponse_t",
   163: "GetAuthSessionTicketResponse_t",
   166: "MarketEligibilityResponse_t",
   167: "DurationControl_t",
   207: "GSGameplayStats_t",
   209: "GSReputation_t",
   210: "AssociateWithClanResult_t",
   304: "PersonaStateChange_t",
   331: "GameOverlayActivated_t",
   341: "DownloadClanActivityCountsResult_t",
   347: "SetPersonaNameResponse_t",
   348: "UnreadChatMessagesChanged_t",
   502: "FavoritesListChanged_t",
   503: "LobbyInvite_t",
   504: "LobbyEnter_t",
   505: "LobbyDataUpdate_t",
   506: "LobbyChatUpdate_t",
   507: "LobbyChatMsg_t",
   509: "LobbyGameCreated_t",
   510: "LobbyMatchList_t",
   512: "LobbyKicked_t",
   513: "LobbyCreated_t",
   516: "FavoritesListAccountsUpdated_t",
   701: "IPCountry_t",
   702: "LowBatteryPower_t",
   703: "SteamAPICallCompleted_t",
   704: "SteamShutdown_t",
   705: "CheckFileSignature_t",
   714: "GamepadTextInputDismissed_t",
   736: "AppResumingFromSuspend_t",
   738: "FloatingGamepadTextInputDismissed_t",
   1005: "DlcInstalled_t",
   1008: "RegisterActivationCodeResponse_t",
   1014: "NewUrlLaunchParameters_t",
   1030: "TimedTrialStatus_t",
   1102: "UserStatsStored_t",
   1104: "LeaderboardFindResult_t",
   1105: "LeaderboardScoresDownloaded_t",
   1106: "LeaderboardScoreUploaded_t",
   1107: "NumberOfCurrentPlayers_t",
   1110: "GlobalAchievementPercentagesReady_t",
   1111: "LeaderboardUGCSet_t",
   1112: "GlobalStatsReceived_t",
   1309: "RemoteStoragePublishFileResult_t",
   1311: "RemoteStorageDeletePublishedFileResult_t",
   1313: "RemoteStorageSubscribePublishedFileResult_t",
   1315: "RemoteStorageUnsubscribePublishedFileResult_t",
   1316: "RemoteStorageUpdatePublishedFileResult_t",
   1320: "RemoteStorageGetPublishedItemVoteDetailsResult_t",
   1321: "RemoteStoragePublishedFileSubscribed_t",
   1322: "RemoteStoragePublishedFileUnsubscribed_t",
   1323: "RemoteStoragePublishedFileDeleted_t",
   1324: "RemoteStorageUpdateUserPublishedItemVoteResult_t",
   1325: "RemoteStorageUserVoteDetails_t",
   1327: "RemoteStorageSetUserPublishedFileActionResult_t",
   1329: "RemoteStoragePublishFileProgress_t",
   1330: "RemoteStoragePublishedFileUpdated_t",
   1331: "RemoteStorageFileWriteAsyncComplete_t",
   1332: "RemoteStorageFileReadAsyncComplete_t",
   1333: "RemoteStorageLocalFileChange_t",
   2101: "HTTPRequestCompleted_t",
   2102: "HTTPRequestHeadersReceived_t",
   2103: "HTTPRequestDataReceived_t",
   2301: "ScreenshotReady_t",
   2302: "ScreenshotRequested_t",
   2801: "SteamInputDeviceConnected_t",
   2802: "SteamInputDeviceDisconnected_t",
   3403: "CreateItemResult_t",
   3404: "SubmitItemUpdateResult_t",
   3405: "ItemInstalled_t",
   3406: "DownloadItemResult_t",
   3407: "UserFavoriteItemsListChanged_t",
   3408: "SetUserItemVoteResult_t",
   3409: "GetUserItemVoteResult_t",
   3410: "StartPlaytimeTrackingResult_t",
   3411: "StopPlaytimeTrackingResult_t",
   3412: "AddUGCDependencyResult_t",
   3413: "RemoveUGCDependencyResult_t",
   3414: "AddAppDependencyResult_t",
   3415: "RemoveAppDependencyResult_t",
   3417: "DeleteItemResult_t",
   3418: "UserSubscribedItemsListChanged_t",
   3420: "WorkshopEULAStatus_t",
   3901: "SteamAppInstalled_t",
   3902: "SteamAppUninstalled_t",
   4001: "PlaybackStatusHasChanged_t",
   4002: "VolumeHasChanged_t",
   4011: "MusicPlayerWantsVolume_t",
   4012: "MusicPlayerSelectsQueueEntry_t",
   4013: "MusicPlayerSelectsPlaylistEntry_t",
   4101: "MusicPlayerRemoteWillActivate_t",
   4102: "MusicPlayerRemoteWillDeactivate_t",
   4103: "MusicPlayerRemoteToFront_t",
   4104: "MusicPlayerWillQuit_t",
   4105: "MusicPlayerWantsPlay_t",
   4106: "MusicPlayerWantsPause_t",
   4107: "MusicPlayerWantsPlayPrevious_t",
   4108: "MusicPlayerWantsPlayNext_t",
   4109: "MusicPlayerWantsShuffled_t",
   4110: "MusicPlayerWantsLooped_t",
   4114: "MusicPlayerWantsPlayingRepeatStatus_t",
   4501: "HTML_BrowserReady_t",
   4502: "HTML_NeedsPaint_t",
   4503: "HTML_StartRequest_t",
   4504: "HTML_CloseBrowser_t",
   4505: "HTML_URLChanged_t",
   4506: "HTML_FinishedRequest_t",
   4507: "HTML_OpenLinkInNewTab_t",
   4508: "HTML_ChangedTitle_t",
   4509: "HTML_SearchResults_t",
   4510: "HTML_CanGoBackAndForward_t",
   4511: "HTML_HorizontalScroll_t",
   4512: "HTML_VerticalScroll_t",
   4513: "HTML_LinkAtPosition_t",
   4514: "HTML_JSAlert_t",
   4515: "HTML_JSConfirm_t",
   4516: "HTML_FileOpenDialog_t",
   4521: "HTML_NewWindow_t",
   4522: "HTML_SetCursor_t",
   4523: "HTML_StatusText_t",
   4524: "HTML_ShowToolTip_t",
   4525: "HTML_UpdateToolTip_t",
   4526: "HTML_HideToolTip_t",
   4527: "HTML_BrowserRestarted_t",
   4624: "GetOPFSettingsResult_t",
   4700: "SteamInventoryResultReady_t",
   4701: "SteamInventoryFullUpdate_t",
   4702: "SteamInventoryDefinitionUpdate_t",
   4704: "SteamInventoryStartPurchaseResult_t",
   5001: "SteamParentalSettingsChanged_t",
   5211: "RequestPlayersForGameProgressCallback_t",
   5213: "RequestPlayersForGameFinalResultCallback_t",
   5215: "EndGameResultCallback_t",
   5302: "CreateBeaconCallback_t",
   5304: "ChangeNumOpenSlotsCallback_t",
   5305: "AvailableBeaconLocationsUpdated_t",
   5306: "ActiveBeaconsUpdated_t",
   5701: "SteamRemotePlaySessionConnected_t",
   5702: "SteamRemotePlaySessionDisconnected_t",
} as const;
export const CallbackStructToId = {
   SteamServersConnected_t: 101,
   SteamServerConnectFailure_t: 102,
   SteamServersDisconnected_t: 103,
   ClientGameServerDeny_t: 113,
   IPCFailure_t: 117,
   LicensesUpdated_t: 125,
   MicroTxnAuthorizationResponse_t: 152,
   EncryptedAppTicketResponse_t: 154,
   GetAuthSessionTicketResponse_t: 163,
   MarketEligibilityResponse_t: 166,
   DurationControl_t: 167,
   PersonaStateChange_t: 304,
   GameOverlayActivated_t: 331,
   DownloadClanActivityCountsResult_t: 341,
   SetPersonaNameResponse_t: 347,
   UnreadChatMessagesChanged_t: 348,
   IPCountry_t: 701,
   LowBatteryPower_t: 702,
   SteamAPICallCompleted_t: 703,
   SteamShutdown_t: 704,
   CheckFileSignature_t: 705,
   GamepadTextInputDismissed_t: 714,
   AppResumingFromSuspend_t: 736,
   FloatingGamepadTextInputDismissed_t: 738,
   FavoritesListChanged_t: 502,
   LobbyInvite_t: 503,
   LobbyEnter_t: 504,
   LobbyDataUpdate_t: 505,
   LobbyChatUpdate_t: 506,
   LobbyChatMsg_t: 507,
   LobbyGameCreated_t: 509,
   LobbyMatchList_t: 510,
   LobbyKicked_t: 512,
   LobbyCreated_t: 513,
   FavoritesListAccountsUpdated_t: 516,
   RequestPlayersForGameProgressCallback_t: 5211,
   RequestPlayersForGameFinalResultCallback_t: 5213,
   EndGameResultCallback_t: 5215,
   CreateBeaconCallback_t: 5302,
   ChangeNumOpenSlotsCallback_t: 5304,
   AvailableBeaconLocationsUpdated_t: 5305,
   ActiveBeaconsUpdated_t: 5306,
   RemoteStoragePublishFileResult_t: 1309,
   RemoteStorageDeletePublishedFileResult_t: 1311,
   RemoteStorageSubscribePublishedFileResult_t: 1313,
   RemoteStorageUnsubscribePublishedFileResult_t: 1315,
   RemoteStorageUpdatePublishedFileResult_t: 1316,
   RemoteStorageGetPublishedItemVoteDetailsResult_t: 1320,
   RemoteStoragePublishedFileSubscribed_t: 1321,
   RemoteStoragePublishedFileUnsubscribed_t: 1322,
   RemoteStoragePublishedFileDeleted_t: 1323,
   RemoteStorageUpdateUserPublishedItemVoteResult_t: 1324,
   RemoteStorageUserVoteDetails_t: 1325,
   RemoteStorageSetUserPublishedFileActionResult_t: 1327,
   RemoteStoragePublishFileProgress_t: 1329,
   RemoteStoragePublishedFileUpdated_t: 1330,
   RemoteStorageFileWriteAsyncComplete_t: 1331,
   RemoteStorageFileReadAsyncComplete_t: 1332,
   RemoteStorageLocalFileChange_t: 1333,
   UserStatsStored_t: 1102,
   LeaderboardFindResult_t: 1104,
   LeaderboardScoresDownloaded_t: 1105,
   LeaderboardScoreUploaded_t: 1106,
   NumberOfCurrentPlayers_t: 1107,
   GlobalAchievementPercentagesReady_t: 1110,
   LeaderboardUGCSet_t: 1111,
   PS3TrophiesInstalled_t: 1112,
   GlobalStatsReceived_t: 1112,
   DlcInstalled_t: 1005,
   RegisterActivationCodeResponse_t: 1008,
   NewUrlLaunchParameters_t: 1014,
   TimedTrialStatus_t: 1030,
   ScreenshotReady_t: 2301,
   ScreenshotRequested_t: 2302,
   PlaybackStatusHasChanged_t: 4001,
   VolumeHasChanged_t: 4002,
   MusicPlayerRemoteWillActivate_t: 4101,
   MusicPlayerRemoteWillDeactivate_t: 4102,
   MusicPlayerRemoteToFront_t: 4103,
   MusicPlayerWillQuit_t: 4104,
   MusicPlayerWantsPlay_t: 4105,
   MusicPlayerWantsPause_t: 4106,
   MusicPlayerWantsPlayPrevious_t: 4107,
   MusicPlayerWantsPlayNext_t: 4108,
   MusicPlayerWantsShuffled_t: 4109,
   MusicPlayerWantsLooped_t: 4110,
   MusicPlayerWantsVolume_t: 4011,
   MusicPlayerSelectsQueueEntry_t: 4012,
   MusicPlayerSelectsPlaylistEntry_t: 4013,
   MusicPlayerWantsPlayingRepeatStatus_t: 4114,
   HTTPRequestCompleted_t: 2101,
   HTTPRequestHeadersReceived_t: 2102,
   HTTPRequestDataReceived_t: 2103,
   SteamInputDeviceConnected_t: 2801,
   SteamInputDeviceDisconnected_t: 2802,
   CreateItemResult_t: 3403,
   SubmitItemUpdateResult_t: 3404,
   ItemInstalled_t: 3405,
   DownloadItemResult_t: 3406,
   UserFavoriteItemsListChanged_t: 3407,
   SetUserItemVoteResult_t: 3408,
   GetUserItemVoteResult_t: 3409,
   StartPlaytimeTrackingResult_t: 3410,
   StopPlaytimeTrackingResult_t: 3411,
   AddUGCDependencyResult_t: 3412,
   RemoveUGCDependencyResult_t: 3413,
   AddAppDependencyResult_t: 3414,
   RemoveAppDependencyResult_t: 3415,
   DeleteItemResult_t: 3417,
   UserSubscribedItemsListChanged_t: 3418,
   WorkshopEULAStatus_t: 3420,
   SteamAppInstalled_t: 3901,
   SteamAppUninstalled_t: 3902,
   HTML_BrowserReady_t: 4501,
   HTML_NeedsPaint_t: 4502,
   HTML_StartRequest_t: 4503,
   HTML_CloseBrowser_t: 4504,
   HTML_URLChanged_t: 4505,
   HTML_FinishedRequest_t: 4506,
   HTML_OpenLinkInNewTab_t: 4507,
   HTML_ChangedTitle_t: 4508,
   HTML_SearchResults_t: 4509,
   HTML_CanGoBackAndForward_t: 4510,
   HTML_HorizontalScroll_t: 4511,
   HTML_VerticalScroll_t: 4512,
   HTML_LinkAtPosition_t: 4513,
   HTML_JSAlert_t: 4514,
   HTML_JSConfirm_t: 4515,
   HTML_FileOpenDialog_t: 4516,
   HTML_NewWindow_t: 4521,
   HTML_SetCursor_t: 4522,
   HTML_StatusText_t: 4523,
   HTML_ShowToolTip_t: 4524,
   HTML_UpdateToolTip_t: 4525,
   HTML_HideToolTip_t: 4526,
   HTML_BrowserRestarted_t: 4527,
   SteamInventoryResultReady_t: 4700,
   SteamInventoryFullUpdate_t: 4701,
   SteamInventoryDefinitionUpdate_t: 4702,
   SteamInventoryStartPurchaseResult_t: 4704,
   GetOPFSettingsResult_t: 4624,
   SteamParentalSettingsChanged_t: 5001,
   SteamRemotePlaySessionConnected_t: 5701,
   SteamRemotePlaySessionDisconnected_t: 5702,
   GSPolicyResponse_t: 115,
   GSGameplayStats_t: 207,
   GSReputation_t: 209,
   AssociateWithClanResult_t: 210,
} as const;
export type CallbackId = keyof typeof CallbackIdToStruct;
export type CallbackStruct = keyof typeof CallbackStructToId;
// Functions
export interface ISteamClient {
   __brand: "ISteamClient";
}
koffi.opaque("ISteamClient");
export const SteamAPI_ISteamClient_CreateSteamPipe: KoffiFunc<(self: ISteamClient) => number> = lib.cdecl(
   "HSteamPipe SteamAPI_ISteamClient_CreateSteamPipe(ISteamClient * self)"
);
export const SteamAPI_ISteamClient_BReleaseSteamPipe: KoffiFunc<(self: ISteamClient, hSteamPipe: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamClient_BReleaseSteamPipe(ISteamClient * self, HSteamPipe hSteamPipe)");
export const SteamAPI_ISteamClient_ConnectToGlobalUser: KoffiFunc<(self: ISteamClient, hSteamPipe: number) => number> =
   lib.cdecl("HSteamUser SteamAPI_ISteamClient_ConnectToGlobalUser(ISteamClient * self, HSteamPipe hSteamPipe)");
export const SteamAPI_ISteamClient_CreateLocalUser: KoffiFunc<
   (self: ISteamClient, phSteamPipe: [number], eAccountType: EAccountType) => number
> = lib.cdecl(
   "HSteamUser SteamAPI_ISteamClient_CreateLocalUser(ISteamClient * self, _Out_ HSteamPipe * phSteamPipe, EAccountType eAccountType)"
);
export const SteamAPI_ISteamClient_ReleaseUser: KoffiFunc<
   (self: ISteamClient, hSteamPipe: number, hUser: number) => void
> = lib.cdecl("void SteamAPI_ISteamClient_ReleaseUser(ISteamClient * self, HSteamPipe hSteamPipe, HSteamUser hUser)");
export const SteamAPI_ISteamClient_GetISteamGenericInterface: KoffiFunc<
   (self: ISteamClient, hSteamUser: number, hSteamPipe: number, pchVersion: string) => Buffer
> = lib.cdecl(
   "void * SteamAPI_ISteamClient_GetISteamGenericInterface(ISteamClient * self, HSteamUser hSteamUser, HSteamPipe hSteamPipe, const char * pchVersion)"
);
export const SteamAPI_ISteamClient_GetIPCCallCount: KoffiFunc<(self: ISteamClient) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamClient_GetIPCCallCount(ISteamClient * self)"
);
export const SteamAPI_ISteamClient_BShutdownIfAllPipesClosed: KoffiFunc<(self: ISteamClient) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamClient_BShutdownIfAllPipesClosed(ISteamClient * self)"
);
export interface ISteamUser {
   __brand: "ISteamUser";
}
koffi.opaque("ISteamUser");
export const SteamAPI_SteamUser_v021: KoffiFunc<() => ISteamUser> = lib.cdecl("ISteamUser* SteamAPI_SteamUser_v021()");
let ISteamUser_Instance: ISteamUser | null = null;
export function SteamAPI_ISteamUser(): ISteamUser {
   if (!ISteamUser_Instance) {
      ISteamUser_Instance = SteamAPI_SteamUser_v021();
   }
   return ISteamUser_Instance;
}
export const SteamAPI_ISteamUser_GetHSteamUser: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "HSteamUser SteamAPI_ISteamUser_GetHSteamUser(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_BLoggedOn: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BLoggedOn(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_GetSteamID: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamUser_GetSteamID(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_InitiateGameConnection_DEPRECATED: KoffiFunc<
   (
      self: ISteamUser,
      pAuthBlob: Buffer,
      cbMaxAuthBlob: number,
      steamIDGameServer: number,
      unIPServer: number,
      usPortServer: number,
      bSecure: boolean
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamUser_InitiateGameConnection_DEPRECATED(ISteamUser * self, _Out_ void * pAuthBlob, int cbMaxAuthBlob, uint64_steamid steamIDGameServer, uint32 unIPServer, uint16 usPortServer, bool bSecure)"
);
export const SteamAPI_ISteamUser_TerminateGameConnection_DEPRECATED: KoffiFunc<
   (self: ISteamUser, unIPServer: number, usPortServer: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamUser_TerminateGameConnection_DEPRECATED(ISteamUser * self, uint32 unIPServer, uint16 usPortServer)"
);
export const SteamAPI_ISteamUser_TrackAppUsageEvent: KoffiFunc<
   (self: ISteamUser, gameID: number, eAppUsageEvent: number, pchExtraInfo: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamUser_TrackAppUsageEvent(ISteamUser * self, uint64_gameid gameID, int eAppUsageEvent, const char * pchExtraInfo)"
);
export const SteamAPI_ISteamUser_GetUserDataFolder: KoffiFunc<
   (self: ISteamUser, pchBuffer: [string], cubBuffer: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUser_GetUserDataFolder(ISteamUser * self, _Out_ char * pchBuffer, int cubBuffer)");
export const SteamAPI_ISteamUser_StartVoiceRecording: KoffiFunc<(self: ISteamUser) => void> = lib.cdecl(
   "void SteamAPI_ISteamUser_StartVoiceRecording(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_StopVoiceRecording: KoffiFunc<(self: ISteamUser) => void> = lib.cdecl(
   "void SteamAPI_ISteamUser_StopVoiceRecording(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_GetAvailableVoice: KoffiFunc<
   (
      self: ISteamUser,
      pcbCompressed: [number],
      pcbUncompressed_Deprecated: [number],
      nUncompressedVoiceDesiredSampleRate_Deprecated: number
   ) => EVoiceResult
> = lib.cdecl(
   "EVoiceResult SteamAPI_ISteamUser_GetAvailableVoice(ISteamUser * self, _Out_ uint32 * pcbCompressed, _Out_ uint32 * pcbUncompressed_Deprecated, uint32 nUncompressedVoiceDesiredSampleRate_Deprecated)"
);
export const SteamAPI_ISteamUser_GetVoice: KoffiFunc<
   (
      self: ISteamUser,
      bWantCompressed: boolean,
      pDestBuffer: Buffer,
      cbDestBufferSize: number,
      nBytesWritten: [number],
      bWantUncompressed_Deprecated: boolean,
      pUncompressedDestBuffer_Deprecated: Buffer,
      cbUncompressedDestBufferSize_Deprecated: number,
      nUncompressBytesWritten_Deprecated: [number],
      nUncompressedVoiceDesiredSampleRate_Deprecated: number
   ) => EVoiceResult
> = lib.cdecl(
   "EVoiceResult SteamAPI_ISteamUser_GetVoice(ISteamUser * self, bool bWantCompressed, _Out_ void * pDestBuffer, uint32 cbDestBufferSize, _Out_ uint32 * nBytesWritten, bool bWantUncompressed_Deprecated, _Out_ void * pUncompressedDestBuffer_Deprecated, uint32 cbUncompressedDestBufferSize_Deprecated, _Out_ uint32 * nUncompressBytesWritten_Deprecated, uint32 nUncompressedVoiceDesiredSampleRate_Deprecated)"
);
export const SteamAPI_ISteamUser_DecompressVoice: KoffiFunc<
   (
      self: ISteamUser,
      pCompressed: Buffer,
      cbCompressed: number,
      pDestBuffer: Buffer,
      cbDestBufferSize: number,
      nBytesWritten: [number],
      nDesiredSampleRate: number
   ) => EVoiceResult
> = lib.cdecl(
   "EVoiceResult SteamAPI_ISteamUser_DecompressVoice(ISteamUser * self, const void * pCompressed, uint32 cbCompressed, _Out_ void * pDestBuffer, uint32 cbDestBufferSize, _Out_ uint32 * nBytesWritten, uint32 nDesiredSampleRate)"
);
export const SteamAPI_ISteamUser_GetVoiceOptimalSampleRate: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUser_GetVoiceOptimalSampleRate(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_GetAuthSessionTicket: KoffiFunc<
   (self: ISteamUser, pTicket: Buffer, cbMaxTicket: number, pcbTicket: [number]) => number
> = lib.cdecl(
   "HAuthTicket SteamAPI_ISteamUser_GetAuthSessionTicket(ISteamUser * self, _Out_ void * pTicket, int cbMaxTicket, _Out_ uint32 * pcbTicket)"
);
export const SteamAPI_ISteamUser_BeginAuthSession: KoffiFunc<
   (self: ISteamUser, pAuthTicket: Buffer, cbAuthTicket: number, steamID: number) => EBeginAuthSessionResult
> = lib.cdecl(
   "EBeginAuthSessionResult SteamAPI_ISteamUser_BeginAuthSession(ISteamUser * self, const void * pAuthTicket, int cbAuthTicket, uint64_steamid steamID)"
);
export const SteamAPI_ISteamUser_EndAuthSession: KoffiFunc<(self: ISteamUser, steamID: number) => void> = lib.cdecl(
   "void SteamAPI_ISteamUser_EndAuthSession(ISteamUser * self, uint64_steamid steamID)"
);
export const SteamAPI_ISteamUser_CancelAuthTicket: KoffiFunc<(self: ISteamUser, hAuthTicket: number) => void> =
   lib.cdecl("void SteamAPI_ISteamUser_CancelAuthTicket(ISteamUser * self, HAuthTicket hAuthTicket)");
export const SteamAPI_ISteamUser_UserHasLicenseForApp: KoffiFunc<
   (self: ISteamUser, steamID: number, appID: number) => EUserHasLicenseForAppResult
> = lib.cdecl(
   "EUserHasLicenseForAppResult SteamAPI_ISteamUser_UserHasLicenseForApp(ISteamUser * self, uint64_steamid steamID, AppId_t appID)"
);
export const SteamAPI_ISteamUser_BIsBehindNAT: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BIsBehindNAT(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_AdvertiseGame: KoffiFunc<
   (self: ISteamUser, steamIDGameServer: number, unIPServer: number, usPortServer: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamUser_AdvertiseGame(ISteamUser * self, uint64_steamid steamIDGameServer, uint32 unIPServer, uint16 usPortServer)"
);
export const SteamAPI_ISteamUser_RequestEncryptedAppTicket: KoffiFunc<
   (self: ISteamUser, pDataToInclude: Buffer, cbDataToInclude: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUser_RequestEncryptedAppTicket(ISteamUser * self, _Out_ void * pDataToInclude, int cbDataToInclude)"
);
export const SteamAPI_ISteamUser_GetEncryptedAppTicket: KoffiFunc<
   (self: ISteamUser, pTicket: Buffer, cbMaxTicket: number, pcbTicket: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUser_GetEncryptedAppTicket(ISteamUser * self, _Out_ void * pTicket, int cbMaxTicket, _Out_ uint32 * pcbTicket)"
);
export const SteamAPI_ISteamUser_GetGameBadgeLevel: KoffiFunc<
   (self: ISteamUser, nSeries: number, bFoil: boolean) => number
> = lib.cdecl("int SteamAPI_ISteamUser_GetGameBadgeLevel(ISteamUser * self, int nSeries, bool bFoil)");
export const SteamAPI_ISteamUser_GetPlayerSteamLevel: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "int SteamAPI_ISteamUser_GetPlayerSteamLevel(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_RequestStoreAuthURL: KoffiFunc<(self: ISteamUser, pchRedirectURL: string) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUser_RequestStoreAuthURL(ISteamUser * self, const char * pchRedirectURL)");
export const SteamAPI_ISteamUser_BIsPhoneVerified: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BIsPhoneVerified(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_BIsTwoFactorEnabled: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BIsTwoFactorEnabled(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_BIsPhoneIdentifying: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BIsPhoneIdentifying(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_BIsPhoneRequiringVerification: KoffiFunc<(self: ISteamUser) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BIsPhoneRequiringVerification(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_GetMarketEligibility: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUser_GetMarketEligibility(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_GetDurationControl: KoffiFunc<(self: ISteamUser) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUser_GetDurationControl(ISteamUser * self)"
);
export const SteamAPI_ISteamUser_BSetDurationControlOnlineState: KoffiFunc<
   (self: ISteamUser, eNewState: EDurationControlOnlineState) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUser_BSetDurationControlOnlineState(ISteamUser * self, EDurationControlOnlineState eNewState)"
);
export interface ISteamFriends {
   __brand: "ISteamFriends";
}
koffi.opaque("ISteamFriends");
export const SteamAPI_SteamFriends_v017: KoffiFunc<() => ISteamFriends> = lib.cdecl(
   "ISteamFriends* SteamAPI_SteamFriends_v017()"
);
let ISteamFriends_Instance: ISteamFriends | null = null;
export function SteamAPI_ISteamFriends(): ISteamFriends {
   if (!ISteamFriends_Instance) {
      ISteamFriends_Instance = SteamAPI_SteamFriends_v017();
   }
   return ISteamFriends_Instance;
}
export const SteamAPI_ISteamFriends_GetPersonaName: KoffiFunc<(self: ISteamFriends) => string> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetPersonaName(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_SetPersonaName: KoffiFunc<(self: ISteamFriends, pchPersonaName: string) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamFriends_SetPersonaName(ISteamFriends * self, const char * pchPersonaName)");
export const SteamAPI_ISteamFriends_GetPersonaState: KoffiFunc<(self: ISteamFriends) => EPersonaState> = lib.cdecl(
   "EPersonaState SteamAPI_ISteamFriends_GetPersonaState(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_GetFriendCount: KoffiFunc<(self: ISteamFriends, iFriendFlags: number) => number> =
   lib.cdecl("int SteamAPI_ISteamFriends_GetFriendCount(ISteamFriends * self, int iFriendFlags)");
export const SteamAPI_ISteamFriends_GetFriendByIndex: KoffiFunc<
   (self: ISteamFriends, iFriend: number, iFriendFlags: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamFriends_GetFriendByIndex(ISteamFriends * self, int iFriend, int iFriendFlags)"
);
export const SteamAPI_ISteamFriends_GetFriendRelationship: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => EFriendRelationship
> = lib.cdecl(
   "EFriendRelationship SteamAPI_ISteamFriends_GetFriendRelationship(ISteamFriends * self, uint64_steamid steamIDFriend)"
);
export const SteamAPI_ISteamFriends_GetFriendPersonaState: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => EPersonaState
> = lib.cdecl(
   "EPersonaState SteamAPI_ISteamFriends_GetFriendPersonaState(ISteamFriends * self, uint64_steamid steamIDFriend)"
);
export const SteamAPI_ISteamFriends_GetFriendPersonaName: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetFriendPersonaName(ISteamFriends * self, uint64_steamid steamIDFriend)"
);
export const SteamAPI_ISteamFriends_GetFriendPersonaNameHistory: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, iPersonaName: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetFriendPersonaNameHistory(ISteamFriends * self, uint64_steamid steamIDFriend, int iPersonaName)"
);
export const SteamAPI_ISteamFriends_GetFriendSteamLevel: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetFriendSteamLevel(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_GetPlayerNickname: KoffiFunc<
   (self: ISteamFriends, steamIDPlayer: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetPlayerNickname(ISteamFriends * self, uint64_steamid steamIDPlayer)"
);
export const SteamAPI_ISteamFriends_GetFriendsGroupCount: KoffiFunc<(self: ISteamFriends) => number> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetFriendsGroupCount(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_GetFriendsGroupIDByIndex: KoffiFunc<(self: ISteamFriends, iFG: number) => number> =
   lib.cdecl("FriendsGroupID_t SteamAPI_ISteamFriends_GetFriendsGroupIDByIndex(ISteamFriends * self, int iFG)");
export const SteamAPI_ISteamFriends_GetFriendsGroupName: KoffiFunc<
   (self: ISteamFriends, friendsGroupID: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetFriendsGroupName(ISteamFriends * self, FriendsGroupID_t friendsGroupID)"
);
export const SteamAPI_ISteamFriends_GetFriendsGroupMembersCount: KoffiFunc<
   (self: ISteamFriends, friendsGroupID: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetFriendsGroupMembersCount(ISteamFriends * self, FriendsGroupID_t friendsGroupID)"
);
export const SteamAPI_ISteamFriends_HasFriend: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, iFriendFlags: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_HasFriend(ISteamFriends * self, uint64_steamid steamIDFriend, int iFriendFlags)"
);
export const SteamAPI_ISteamFriends_GetClanCount: KoffiFunc<(self: ISteamFriends) => number> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetClanCount(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_GetClanByIndex: KoffiFunc<(self: ISteamFriends, iClan: number) => number> =
   lib.cdecl("uint64_steamid SteamAPI_ISteamFriends_GetClanByIndex(ISteamFriends * self, int iClan)");
export const SteamAPI_ISteamFriends_GetClanName: KoffiFunc<(self: ISteamFriends, steamIDClan: number) => string> =
   lib.cdecl("const char * SteamAPI_ISteamFriends_GetClanName(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetClanTag: KoffiFunc<(self: ISteamFriends, steamIDClan: number) => string> =
   lib.cdecl("const char * SteamAPI_ISteamFriends_GetClanTag(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetClanActivityCounts: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number, pnOnline: [number], pnInGame: [number], pnChatting: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_GetClanActivityCounts(ISteamFriends * self, uint64_steamid steamIDClan, _Out_ int * pnOnline, _Out_ int * pnInGame, _Out_ int * pnChatting)"
);
export const SteamAPI_ISteamFriends_GetFriendCountFromSource: KoffiFunc<
   (self: ISteamFriends, steamIDSource: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetFriendCountFromSource(ISteamFriends * self, uint64_steamid steamIDSource)"
);
export const SteamAPI_ISteamFriends_GetFriendFromSourceByIndex: KoffiFunc<
   (self: ISteamFriends, steamIDSource: number, iFriend: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamFriends_GetFriendFromSourceByIndex(ISteamFriends * self, uint64_steamid steamIDSource, int iFriend)"
);
export const SteamAPI_ISteamFriends_IsUserInSource: KoffiFunc<
   (self: ISteamFriends, steamIDUser: number, steamIDSource: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_IsUserInSource(ISteamFriends * self, uint64_steamid steamIDUser, uint64_steamid steamIDSource)"
);
export const SteamAPI_ISteamFriends_SetInGameVoiceSpeaking: KoffiFunc<
   (self: ISteamFriends, steamIDUser: number, bSpeaking: boolean) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_SetInGameVoiceSpeaking(ISteamFriends * self, uint64_steamid steamIDUser, bool bSpeaking)"
);
export const SteamAPI_ISteamFriends_ActivateGameOverlay: KoffiFunc<(self: ISteamFriends, pchDialog: string) => void> =
   lib.cdecl("void SteamAPI_ISteamFriends_ActivateGameOverlay(ISteamFriends * self, const char * pchDialog)");
export const SteamAPI_ISteamFriends_ActivateGameOverlayToUser: KoffiFunc<
   (self: ISteamFriends, pchDialog: string, steamID: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayToUser(ISteamFriends * self, const char * pchDialog, uint64_steamid steamID)"
);
export const SteamAPI_ISteamFriends_ActivateGameOverlayToWebPage: KoffiFunc<
   (self: ISteamFriends, pchURL: string, eMode: EActivateGameOverlayToWebPageMode) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayToWebPage(ISteamFriends * self, const char * pchURL, EActivateGameOverlayToWebPageMode eMode)"
);
export const SteamAPI_ISteamFriends_ActivateGameOverlayToStore: KoffiFunc<
   (self: ISteamFriends, nAppID: number, eFlag: EOverlayToStoreFlag) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayToStore(ISteamFriends * self, AppId_t nAppID, EOverlayToStoreFlag eFlag)"
);
export const SteamAPI_ISteamFriends_SetPlayedWith: KoffiFunc<
   (self: ISteamFriends, steamIDUserPlayedWith: number) => void
> = lib.cdecl("void SteamAPI_ISteamFriends_SetPlayedWith(ISteamFriends * self, uint64_steamid steamIDUserPlayedWith)");
export const SteamAPI_ISteamFriends_ActivateGameOverlayInviteDialog: KoffiFunc<
   (self: ISteamFriends, steamIDLobby: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayInviteDialog(ISteamFriends * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamFriends_GetSmallFriendAvatar: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetSmallFriendAvatar(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_GetMediumFriendAvatar: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetMediumFriendAvatar(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_GetLargeFriendAvatar: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetLargeFriendAvatar(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_RequestUserInformation: KoffiFunc<
   (self: ISteamFriends, steamIDUser: number, bRequireNameOnly: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_RequestUserInformation(ISteamFriends * self, uint64_steamid steamIDUser, bool bRequireNameOnly)"
);
export const SteamAPI_ISteamFriends_RequestClanOfficerList: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamFriends_RequestClanOfficerList(ISteamFriends * self, uint64_steamid steamIDClan)"
);
export const SteamAPI_ISteamFriends_GetClanOwner: KoffiFunc<(self: ISteamFriends, steamIDClan: number) => number> =
   lib.cdecl("uint64_steamid SteamAPI_ISteamFriends_GetClanOwner(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetClanOfficerCount: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetClanOfficerCount(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetClanOfficerByIndex: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number, iOfficer: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamFriends_GetClanOfficerByIndex(ISteamFriends * self, uint64_steamid steamIDClan, int iOfficer)"
);
export const SteamAPI_ISteamFriends_GetUserRestrictions: KoffiFunc<(self: ISteamFriends) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamFriends_GetUserRestrictions(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_SetRichPresence: KoffiFunc<
   (self: ISteamFriends, pchKey: string, pchValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_SetRichPresence(ISteamFriends * self, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamFriends_ClearRichPresence: KoffiFunc<(self: ISteamFriends) => void> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ClearRichPresence(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_GetFriendRichPresence: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, pchKey: string) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetFriendRichPresence(ISteamFriends * self, uint64_steamid steamIDFriend, const char * pchKey)"
);
export const SteamAPI_ISteamFriends_GetFriendRichPresenceKeyCount: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetFriendRichPresenceKeyCount(ISteamFriends * self, uint64_steamid steamIDFriend)"
);
export const SteamAPI_ISteamFriends_GetFriendRichPresenceKeyByIndex: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, iKey: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamFriends_GetFriendRichPresenceKeyByIndex(ISteamFriends * self, uint64_steamid steamIDFriend, int iKey)"
);
export const SteamAPI_ISteamFriends_RequestFriendRichPresence: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_RequestFriendRichPresence(ISteamFriends * self, uint64_steamid steamIDFriend)"
);
export const SteamAPI_ISteamFriends_InviteUserToGame: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, pchConnectString: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_InviteUserToGame(ISteamFriends * self, uint64_steamid steamIDFriend, const char * pchConnectString)"
);
export const SteamAPI_ISteamFriends_GetCoplayFriendCount: KoffiFunc<(self: ISteamFriends) => number> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetCoplayFriendCount(ISteamFriends * self)"
);
export const SteamAPI_ISteamFriends_GetCoplayFriend: KoffiFunc<(self: ISteamFriends, iCoplayFriend: number) => number> =
   lib.cdecl("uint64_steamid SteamAPI_ISteamFriends_GetCoplayFriend(ISteamFriends * self, int iCoplayFriend)");
export const SteamAPI_ISteamFriends_GetFriendCoplayTime: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetFriendCoplayTime(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_GetFriendCoplayGame: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number) => number
> = lib.cdecl("AppId_t SteamAPI_ISteamFriends_GetFriendCoplayGame(ISteamFriends * self, uint64_steamid steamIDFriend)");
export const SteamAPI_ISteamFriends_JoinClanChatRoom: KoffiFunc<(self: ISteamFriends, steamIDClan: number) => number> =
   lib.cdecl(
      "SteamAPICall_t SteamAPI_ISteamFriends_JoinClanChatRoom(ISteamFriends * self, uint64_steamid steamIDClan)"
   );
export const SteamAPI_ISteamFriends_LeaveClanChatRoom: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamFriends_LeaveClanChatRoom(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetClanChatMemberCount: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number) => number
> = lib.cdecl("int SteamAPI_ISteamFriends_GetClanChatMemberCount(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetChatMemberByIndex: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number, iUser: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamFriends_GetChatMemberByIndex(ISteamFriends * self, uint64_steamid steamIDClan, int iUser)"
);
export const SteamAPI_ISteamFriends_SendClanChatMessage: KoffiFunc<
   (self: ISteamFriends, steamIDClanChat: number, pchText: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_SendClanChatMessage(ISteamFriends * self, uint64_steamid steamIDClanChat, const char * pchText)"
);
export const SteamAPI_ISteamFriends_IsClanChatAdmin: KoffiFunc<
   (self: ISteamFriends, steamIDClanChat: number, steamIDUser: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_IsClanChatAdmin(ISteamFriends * self, uint64_steamid steamIDClanChat, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamFriends_IsClanChatWindowOpenInSteam: KoffiFunc<
   (self: ISteamFriends, steamIDClanChat: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_IsClanChatWindowOpenInSteam(ISteamFriends * self, uint64_steamid steamIDClanChat)"
);
export const SteamAPI_ISteamFriends_OpenClanChatWindowInSteam: KoffiFunc<
   (self: ISteamFriends, steamIDClanChat: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_OpenClanChatWindowInSteam(ISteamFriends * self, uint64_steamid steamIDClanChat)"
);
export const SteamAPI_ISteamFriends_CloseClanChatWindowInSteam: KoffiFunc<
   (self: ISteamFriends, steamIDClanChat: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_CloseClanChatWindowInSteam(ISteamFriends * self, uint64_steamid steamIDClanChat)"
);
export const SteamAPI_ISteamFriends_SetListenForFriendsMessages: KoffiFunc<
   (self: ISteamFriends, bInterceptEnabled: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamFriends_SetListenForFriendsMessages(ISteamFriends * self, bool bInterceptEnabled)");
export const SteamAPI_ISteamFriends_ReplyToFriendMessage: KoffiFunc<
   (self: ISteamFriends, steamIDFriend: number, pchMsgToSend: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_ReplyToFriendMessage(ISteamFriends * self, uint64_steamid steamIDFriend, const char * pchMsgToSend)"
);
export const SteamAPI_ISteamFriends_GetFriendMessage: KoffiFunc<
   (
      self: ISteamFriends,
      steamIDFriend: number,
      iMessageID: number,
      pvData: Buffer,
      cubData: number,
      peChatEntryType: [EChatEntryType]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamFriends_GetFriendMessage(ISteamFriends * self, uint64_steamid steamIDFriend, int iMessageID, _Out_ void * pvData, int cubData, _Out_ EChatEntryType * peChatEntryType)"
);
export const SteamAPI_ISteamFriends_GetFollowerCount: KoffiFunc<(self: ISteamFriends, steamID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamFriends_GetFollowerCount(ISteamFriends * self, uint64_steamid steamID)");
export const SteamAPI_ISteamFriends_IsFollowing: KoffiFunc<(self: ISteamFriends, steamID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamFriends_IsFollowing(ISteamFriends * self, uint64_steamid steamID)");
export const SteamAPI_ISteamFriends_EnumerateFollowingList: KoffiFunc<
   (self: ISteamFriends, unStartIndex: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamFriends_EnumerateFollowingList(ISteamFriends * self, uint32 unStartIndex)"
);
export const SteamAPI_ISteamFriends_IsClanPublic: KoffiFunc<(self: ISteamFriends, steamIDClan: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamFriends_IsClanPublic(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_IsClanOfficialGameGroup: KoffiFunc<
   (self: ISteamFriends, steamIDClan: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamFriends_IsClanOfficialGameGroup(ISteamFriends * self, uint64_steamid steamIDClan)");
export const SteamAPI_ISteamFriends_GetNumChatsWithUnreadPriorityMessages: KoffiFunc<(self: ISteamFriends) => number> =
   lib.cdecl("int SteamAPI_ISteamFriends_GetNumChatsWithUnreadPriorityMessages(ISteamFriends * self)");
export const SteamAPI_ISteamFriends_ActivateGameOverlayRemotePlayTogetherInviteDialog: KoffiFunc<
   (self: ISteamFriends, steamIDLobby: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayRemotePlayTogetherInviteDialog(ISteamFriends * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamFriends_RegisterProtocolInOverlayBrowser: KoffiFunc<
   (self: ISteamFriends, pchProtocol: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamFriends_RegisterProtocolInOverlayBrowser(ISteamFriends * self, const char * pchProtocol)"
);
export const SteamAPI_ISteamFriends_ActivateGameOverlayInviteDialogConnectString: KoffiFunc<
   (self: ISteamFriends, pchConnectString: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamFriends_ActivateGameOverlayInviteDialogConnectString(ISteamFriends * self, const char * pchConnectString)"
);
export interface ISteamUtils {
   __brand: "ISteamUtils";
}
koffi.opaque("ISteamUtils");
export const SteamAPI_SteamUtils_v010: KoffiFunc<() => ISteamUtils> = lib.cdecl(
   "ISteamUtils* SteamAPI_SteamUtils_v010()"
);
let ISteamUtils_Instance: ISteamUtils | null = null;
export function SteamAPI_ISteamUtils(): ISteamUtils {
   if (!ISteamUtils_Instance) {
      ISteamUtils_Instance = SteamAPI_SteamUtils_v010();
   }
   return ISteamUtils_Instance;
}
export const SteamAPI_ISteamUtils_GetSecondsSinceAppActive: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetSecondsSinceAppActive(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetSecondsSinceComputerActive: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetSecondsSinceComputerActive(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetConnectedUniverse: KoffiFunc<(self: ISteamUtils) => EUniverse> = lib.cdecl(
   "EUniverse SteamAPI_ISteamUtils_GetConnectedUniverse(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetServerRealTime: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetServerRealTime(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetIPCountry: KoffiFunc<(self: ISteamUtils) => string> = lib.cdecl(
   "const char * SteamAPI_ISteamUtils_GetIPCountry(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetImageSize: KoffiFunc<
   (self: ISteamUtils, iImage: number, pnWidth: [number], pnHeight: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_GetImageSize(ISteamUtils * self, int iImage, _Out_ uint32 * pnWidth, _Out_ uint32 * pnHeight)"
);
export const SteamAPI_ISteamUtils_GetImageRGBA: KoffiFunc<
   (self: ISteamUtils, iImage: number, pubDest: [number], nDestBufferSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_GetImageRGBA(ISteamUtils * self, int iImage, _Out_ uint8 * pubDest, int nDestBufferSize)"
);
export const SteamAPI_ISteamUtils_GetCurrentBatteryPower: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint8 SteamAPI_ISteamUtils_GetCurrentBatteryPower(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetAppID: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetAppID(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_SetOverlayNotificationPosition: KoffiFunc<
   (self: ISteamUtils, eNotificationPosition: ENotificationPosition) => void
> = lib.cdecl(
   "void SteamAPI_ISteamUtils_SetOverlayNotificationPosition(ISteamUtils * self, ENotificationPosition eNotificationPosition)"
);
export const SteamAPI_ISteamUtils_IsAPICallCompleted: KoffiFunc<
   (self: ISteamUtils, hSteamAPICall: number, pbFailed: [boolean]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsAPICallCompleted(ISteamUtils * self, SteamAPICall_t hSteamAPICall, _Out_ bool * pbFailed)"
);
export const SteamAPI_ISteamUtils_GetAPICallFailureReason: KoffiFunc<
   (self: ISteamUtils, hSteamAPICall: number) => ESteamAPICallFailure
> = lib.cdecl(
   "ESteamAPICallFailure SteamAPI_ISteamUtils_GetAPICallFailureReason(ISteamUtils * self, SteamAPICall_t hSteamAPICall)"
);
export const SteamAPI_ISteamUtils_GetAPICallResult: KoffiFunc<
   (
      self: ISteamUtils,
      hSteamAPICall: number,
      pCallback: Buffer,
      cubCallback: number,
      iCallbackExpected: number,
      pbFailed: [boolean]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_GetAPICallResult(ISteamUtils * self, SteamAPICall_t hSteamAPICall, _Out_ void * pCallback, int cubCallback, int iCallbackExpected, _Out_ bool * pbFailed)"
);
export const SteamAPI_ISteamUtils_GetIPCCallCount: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetIPCCallCount(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_IsOverlayEnabled: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsOverlayEnabled(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_BOverlayNeedsPresent: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_BOverlayNeedsPresent(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_CheckFileSignature: KoffiFunc<(self: ISteamUtils, szFileName: string) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUtils_CheckFileSignature(ISteamUtils * self, const char * szFileName)");
export const SteamAPI_ISteamUtils_ShowGamepadTextInput: KoffiFunc<
   (
      self: ISteamUtils,
      eInputMode: EGamepadTextInputMode,
      eLineInputMode: EGamepadTextInputLineMode,
      pchDescription: string,
      unCharMax: number,
      pchExistingText: string
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_ShowGamepadTextInput(ISteamUtils * self, EGamepadTextInputMode eInputMode, EGamepadTextInputLineMode eLineInputMode, const char * pchDescription, uint32 unCharMax, const char * pchExistingText)"
);
export const SteamAPI_ISteamUtils_GetEnteredGamepadTextLength: KoffiFunc<(self: ISteamUtils) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUtils_GetEnteredGamepadTextLength(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_GetEnteredGamepadTextInput: KoffiFunc<
   (self: ISteamUtils, pchText: [string], cchText: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_GetEnteredGamepadTextInput(ISteamUtils * self, _Out_ char * pchText, uint32 cchText)"
);
export const SteamAPI_ISteamUtils_GetSteamUILanguage: KoffiFunc<(self: ISteamUtils) => string> = lib.cdecl(
   "const char * SteamAPI_ISteamUtils_GetSteamUILanguage(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_IsSteamRunningInVR: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsSteamRunningInVR(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_SetOverlayNotificationInset: KoffiFunc<
   (self: ISteamUtils, nHorizontalInset: number, nVerticalInset: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamUtils_SetOverlayNotificationInset(ISteamUtils * self, int nHorizontalInset, int nVerticalInset)"
);
export const SteamAPI_ISteamUtils_IsSteamInBigPictureMode: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsSteamInBigPictureMode(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_StartVRDashboard: KoffiFunc<(self: ISteamUtils) => void> = lib.cdecl(
   "void SteamAPI_ISteamUtils_StartVRDashboard(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_IsVRHeadsetStreamingEnabled: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsVRHeadsetStreamingEnabled(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_SetVRHeadsetStreamingEnabled: KoffiFunc<
   (self: ISteamUtils, bEnabled: boolean) => void
> = lib.cdecl("void SteamAPI_ISteamUtils_SetVRHeadsetStreamingEnabled(ISteamUtils * self, bool bEnabled)");
export const SteamAPI_ISteamUtils_IsSteamChinaLauncher: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsSteamChinaLauncher(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_InitFilterText: KoffiFunc<(self: ISteamUtils, unFilterOptions: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUtils_InitFilterText(ISteamUtils * self, uint32 unFilterOptions)");
export const SteamAPI_ISteamUtils_FilterText: KoffiFunc<
   (
      self: ISteamUtils,
      eContext: ETextFilteringContext,
      sourceSteamID: number,
      pchInputMessage: string,
      pchOutFilteredText: [string],
      nByteSizeOutFilteredText: number
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamUtils_FilterText(ISteamUtils * self, ETextFilteringContext eContext, uint64_steamid sourceSteamID, const char * pchInputMessage, _Out_ char * pchOutFilteredText, uint32 nByteSizeOutFilteredText)"
);
export const SteamAPI_ISteamUtils_GetIPv6ConnectivityState: KoffiFunc<
   (self: ISteamUtils, eProtocol: ESteamIPv6ConnectivityProtocol) => ESteamIPv6ConnectivityState
> = lib.cdecl(
   "ESteamIPv6ConnectivityState SteamAPI_ISteamUtils_GetIPv6ConnectivityState(ISteamUtils * self, ESteamIPv6ConnectivityProtocol eProtocol)"
);
export const SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck: KoffiFunc<(self: ISteamUtils) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_IsSteamRunningOnSteamDeck(ISteamUtils * self)"
);
export const SteamAPI_ISteamUtils_ShowFloatingGamepadTextInput: KoffiFunc<
   (
      self: ISteamUtils,
      eKeyboardMode: EFloatingGamepadTextInputMode,
      nTextFieldXPosition: number,
      nTextFieldYPosition: number,
      nTextFieldWidth: number,
      nTextFieldHeight: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUtils_ShowFloatingGamepadTextInput(ISteamUtils * self, EFloatingGamepadTextInputMode eKeyboardMode, int nTextFieldXPosition, int nTextFieldYPosition, int nTextFieldWidth, int nTextFieldHeight)"
);
export const SteamAPI_ISteamUtils_SetGameLauncherMode: KoffiFunc<(self: ISteamUtils, bLauncherMode: boolean) => void> =
   lib.cdecl("void SteamAPI_ISteamUtils_SetGameLauncherMode(ISteamUtils * self, bool bLauncherMode)");
export const SteamAPI_ISteamUtils_DismissFloatingGamepadTextInput: KoffiFunc<(self: ISteamUtils) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUtils_DismissFloatingGamepadTextInput(ISteamUtils * self)");
export interface ISteamMatchmaking {
   __brand: "ISteamMatchmaking";
}
koffi.opaque("ISteamMatchmaking");
export const SteamAPI_SteamMatchmaking_v009: KoffiFunc<() => ISteamMatchmaking> = lib.cdecl(
   "ISteamMatchmaking* SteamAPI_SteamMatchmaking_v009()"
);
let ISteamMatchmaking_Instance: ISteamMatchmaking | null = null;
export function SteamAPI_ISteamMatchmaking(): ISteamMatchmaking {
   if (!ISteamMatchmaking_Instance) {
      ISteamMatchmaking_Instance = SteamAPI_SteamMatchmaking_v009();
   }
   return ISteamMatchmaking_Instance;
}
export const SteamAPI_ISteamMatchmaking_GetFavoriteGameCount: KoffiFunc<(self: ISteamMatchmaking) => number> =
   lib.cdecl("int SteamAPI_ISteamMatchmaking_GetFavoriteGameCount(ISteamMatchmaking * self)");
export const SteamAPI_ISteamMatchmaking_GetFavoriteGame: KoffiFunc<
   (
      self: ISteamMatchmaking,
      iGame: number,
      pnAppID: [number],
      pnIP: [number],
      pnConnPort: [number],
      pnQueryPort: [number],
      punFlags: [number],
      pRTime32LastPlayedOnServer: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_GetFavoriteGame(ISteamMatchmaking * self, int iGame, _Out_ AppId_t * pnAppID, _Out_ uint32 * pnIP, _Out_ uint16 * pnConnPort, _Out_ uint16 * pnQueryPort, _Out_ uint32 * punFlags, _Out_ uint32 * pRTime32LastPlayedOnServer)"
);
export const SteamAPI_ISteamMatchmaking_AddFavoriteGame: KoffiFunc<
   (
      self: ISteamMatchmaking,
      nAppID: number,
      nIP: number,
      nConnPort: number,
      nQueryPort: number,
      unFlags: number,
      rTime32LastPlayedOnServer: number
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamMatchmaking_AddFavoriteGame(ISteamMatchmaking * self, AppId_t nAppID, uint32 nIP, uint16 nConnPort, uint16 nQueryPort, uint32 unFlags, uint32 rTime32LastPlayedOnServer)"
);
export const SteamAPI_ISteamMatchmaking_RemoveFavoriteGame: KoffiFunc<
   (
      self: ISteamMatchmaking,
      nAppID: number,
      nIP: number,
      nConnPort: number,
      nQueryPort: number,
      unFlags: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_RemoveFavoriteGame(ISteamMatchmaking * self, AppId_t nAppID, uint32 nIP, uint16 nConnPort, uint16 nQueryPort, uint32 unFlags)"
);
export const SteamAPI_ISteamMatchmaking_RequestLobbyList: KoffiFunc<(self: ISteamMatchmaking) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamMatchmaking_RequestLobbyList(ISteamMatchmaking * self)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListStringFilter: KoffiFunc<
   (self: ISteamMatchmaking, pchKeyToMatch: string, pchValueToMatch: string, eComparisonType: ELobbyComparison) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListStringFilter(ISteamMatchmaking * self, const char * pchKeyToMatch, const char * pchValueToMatch, ELobbyComparison eComparisonType)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListNumericalFilter: KoffiFunc<
   (self: ISteamMatchmaking, pchKeyToMatch: string, nValueToMatch: number, eComparisonType: ELobbyComparison) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListNumericalFilter(ISteamMatchmaking * self, const char * pchKeyToMatch, int nValueToMatch, ELobbyComparison eComparisonType)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListNearValueFilter: KoffiFunc<
   (self: ISteamMatchmaking, pchKeyToMatch: string, nValueToBeCloseTo: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListNearValueFilter(ISteamMatchmaking * self, const char * pchKeyToMatch, int nValueToBeCloseTo)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListFilterSlotsAvailable: KoffiFunc<
   (self: ISteamMatchmaking, nSlotsAvailable: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListFilterSlotsAvailable(ISteamMatchmaking * self, int nSlotsAvailable)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListDistanceFilter: KoffiFunc<
   (self: ISteamMatchmaking, eLobbyDistanceFilter: ELobbyDistanceFilter) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListDistanceFilter(ISteamMatchmaking * self, ELobbyDistanceFilter eLobbyDistanceFilter)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListResultCountFilter: KoffiFunc<
   (self: ISteamMatchmaking, cMaxResults: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListResultCountFilter(ISteamMatchmaking * self, int cMaxResults)"
);
export const SteamAPI_ISteamMatchmaking_AddRequestLobbyListCompatibleMembersFilter: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_AddRequestLobbyListCompatibleMembersFilter(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyByIndex: KoffiFunc<
   (self: ISteamMatchmaking, iLobby: number) => number
> = lib.cdecl("uint64_steamid SteamAPI_ISteamMatchmaking_GetLobbyByIndex(ISteamMatchmaking * self, int iLobby)");
export const SteamAPI_ISteamMatchmaking_CreateLobby: KoffiFunc<
   (self: ISteamMatchmaking, eLobbyType: ELobbyType, cMaxMembers: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamMatchmaking_CreateLobby(ISteamMatchmaking * self, ELobbyType eLobbyType, int cMaxMembers)"
);
export const SteamAPI_ISteamMatchmaking_JoinLobby: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamMatchmaking_JoinLobby(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_LeaveLobby: KoffiFunc<(self: ISteamMatchmaking, steamIDLobby: number) => void> =
   lib.cdecl("void SteamAPI_ISteamMatchmaking_LeaveLobby(ISteamMatchmaking * self, uint64_steamid steamIDLobby)");
export const SteamAPI_ISteamMatchmaking_InviteUserToLobby: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, steamIDInvitee: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_InviteUserToLobby(ISteamMatchmaking * self, uint64_steamid steamIDLobby, uint64_steamid steamIDInvitee)"
);
export const SteamAPI_ISteamMatchmaking_GetNumLobbyMembers: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamMatchmaking_GetNumLobbyMembers(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyMemberByIndex: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, iMember: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamMatchmaking_GetLobbyMemberByIndex(ISteamMatchmaking * self, uint64_steamid steamIDLobby, int iMember)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, pchKey: string) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamMatchmaking_GetLobbyData(ISteamMatchmaking * self, uint64_steamid steamIDLobby, const char * pchKey)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, pchKey: string, pchValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLobbyData(ISteamMatchmaking * self, uint64_steamid steamIDLobby, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyDataCount: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamMatchmaking_GetLobbyDataCount(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyDataByIndex: KoffiFunc<
   (
      self: ISteamMatchmaking,
      steamIDLobby: number,
      iLobbyData: number,
      pchKey: [string],
      cchKeyBufferSize: number,
      pchValue: [string],
      cchValueBufferSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_GetLobbyDataByIndex(ISteamMatchmaking * self, uint64_steamid steamIDLobby, int iLobbyData, _Out_ char * pchKey, int cchKeyBufferSize, _Out_ char * pchValue, int cchValueBufferSize)"
);
export const SteamAPI_ISteamMatchmaking_DeleteLobbyData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, pchKey: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_DeleteLobbyData(ISteamMatchmaking * self, uint64_steamid steamIDLobby, const char * pchKey)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyMemberData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, steamIDUser: number, pchKey: string) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamMatchmaking_GetLobbyMemberData(ISteamMatchmaking * self, uint64_steamid steamIDLobby, uint64_steamid steamIDUser, const char * pchKey)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyMemberData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, pchKey: string, pchValue: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_SetLobbyMemberData(ISteamMatchmaking * self, uint64_steamid steamIDLobby, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamMatchmaking_SendLobbyChatMsg: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, pvMsgBody: Buffer, cubMsgBody: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SendLobbyChatMsg(ISteamMatchmaking * self, uint64_steamid steamIDLobby, const void * pvMsgBody, int cubMsgBody)"
);
export const SteamAPI_ISteamMatchmaking_RequestLobbyData: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_RequestLobbyData(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyGameServer: KoffiFunc<
   (
      self: ISteamMatchmaking,
      steamIDLobby: number,
      unGameServerIP: number,
      unGameServerPort: number,
      steamIDGameServer: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmaking_SetLobbyGameServer(ISteamMatchmaking * self, uint64_steamid steamIDLobby, uint32 unGameServerIP, uint16 unGameServerPort, uint64_steamid steamIDGameServer)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyMemberLimit: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, cMaxMembers: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLobbyMemberLimit(ISteamMatchmaking * self, uint64_steamid steamIDLobby, int cMaxMembers)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyMemberLimit: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamMatchmaking_GetLobbyMemberLimit(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyType: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, eLobbyType: ELobbyType) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLobbyType(ISteamMatchmaking * self, uint64_steamid steamIDLobby, ELobbyType eLobbyType)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyJoinable: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, bLobbyJoinable: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLobbyJoinable(ISteamMatchmaking * self, uint64_steamid steamIDLobby, bool bLobbyJoinable)"
);
export const SteamAPI_ISteamMatchmaking_GetLobbyOwner: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamMatchmaking_GetLobbyOwner(ISteamMatchmaking * self, uint64_steamid steamIDLobby)"
);
export const SteamAPI_ISteamMatchmaking_SetLobbyOwner: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, steamIDNewOwner: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLobbyOwner(ISteamMatchmaking * self, uint64_steamid steamIDLobby, uint64_steamid steamIDNewOwner)"
);
export const SteamAPI_ISteamMatchmaking_SetLinkedLobby: KoffiFunc<
   (self: ISteamMatchmaking, steamIDLobby: number, steamIDLobbyDependent: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmaking_SetLinkedLobby(ISteamMatchmaking * self, uint64_steamid steamIDLobby, uint64_steamid steamIDLobbyDependent)"
);
export interface ISteamMatchmakingServerListResponse {
   __brand: "ISteamMatchmakingServerListResponse";
}
koffi.opaque("ISteamMatchmakingServerListResponse");
export const SteamAPI_ISteamMatchmakingServerListResponse_ServerResponded: KoffiFunc<
   (self: ISteamMatchmakingServerListResponse, hRequest: Buffer, iServer: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServerListResponse_ServerResponded(ISteamMatchmakingServerListResponse * self, HServerListRequest hRequest, int iServer)"
);
export const SteamAPI_ISteamMatchmakingServerListResponse_ServerFailedToRespond: KoffiFunc<
   (self: ISteamMatchmakingServerListResponse, hRequest: Buffer, iServer: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServerListResponse_ServerFailedToRespond(ISteamMatchmakingServerListResponse * self, HServerListRequest hRequest, int iServer)"
);
export const SteamAPI_ISteamMatchmakingServerListResponse_RefreshComplete: KoffiFunc<
   (self: ISteamMatchmakingServerListResponse, hRequest: Buffer, response: EMatchMakingServerResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServerListResponse_RefreshComplete(ISteamMatchmakingServerListResponse * self, HServerListRequest hRequest, EMatchMakingServerResponse response)"
);
export interface ISteamMatchmakingPingResponse {
   __brand: "ISteamMatchmakingPingResponse";
}
koffi.opaque("ISteamMatchmakingPingResponse");
export const SteamAPI_ISteamMatchmakingPingResponse_ServerFailedToRespond: KoffiFunc<
   (self: ISteamMatchmakingPingResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingPingResponse_ServerFailedToRespond(ISteamMatchmakingPingResponse * self)"
);
export interface ISteamMatchmakingPlayersResponse {
   __brand: "ISteamMatchmakingPlayersResponse";
}
koffi.opaque("ISteamMatchmakingPlayersResponse");
export const SteamAPI_ISteamMatchmakingPlayersResponse_AddPlayerToList: KoffiFunc<
   (self: ISteamMatchmakingPlayersResponse, pchName: string, nScore: number, flTimePlayed: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingPlayersResponse_AddPlayerToList(ISteamMatchmakingPlayersResponse * self, const char * pchName, int nScore, float flTimePlayed)"
);
export const SteamAPI_ISteamMatchmakingPlayersResponse_PlayersFailedToRespond: KoffiFunc<
   (self: ISteamMatchmakingPlayersResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingPlayersResponse_PlayersFailedToRespond(ISteamMatchmakingPlayersResponse * self)"
);
export const SteamAPI_ISteamMatchmakingPlayersResponse_PlayersRefreshComplete: KoffiFunc<
   (self: ISteamMatchmakingPlayersResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingPlayersResponse_PlayersRefreshComplete(ISteamMatchmakingPlayersResponse * self)"
);
export interface ISteamMatchmakingRulesResponse {
   __brand: "ISteamMatchmakingRulesResponse";
}
koffi.opaque("ISteamMatchmakingRulesResponse");
export const SteamAPI_ISteamMatchmakingRulesResponse_RulesResponded: KoffiFunc<
   (self: ISteamMatchmakingRulesResponse, pchRule: string, pchValue: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingRulesResponse_RulesResponded(ISteamMatchmakingRulesResponse * self, const char * pchRule, const char * pchValue)"
);
export const SteamAPI_ISteamMatchmakingRulesResponse_RulesFailedToRespond: KoffiFunc<
   (self: ISteamMatchmakingRulesResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingRulesResponse_RulesFailedToRespond(ISteamMatchmakingRulesResponse * self)"
);
export const SteamAPI_ISteamMatchmakingRulesResponse_RulesRefreshComplete: KoffiFunc<
   (self: ISteamMatchmakingRulesResponse) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingRulesResponse_RulesRefreshComplete(ISteamMatchmakingRulesResponse * self)"
);
export interface ISteamMatchmakingServers {
   __brand: "ISteamMatchmakingServers";
}
koffi.opaque("ISteamMatchmakingServers");
export const SteamAPI_SteamMatchmakingServers_v002: KoffiFunc<() => ISteamMatchmakingServers> = lib.cdecl(
   "ISteamMatchmakingServers* SteamAPI_SteamMatchmakingServers_v002()"
);
let ISteamMatchmakingServers_Instance: ISteamMatchmakingServers | null = null;
export function SteamAPI_ISteamMatchmakingServers(): ISteamMatchmakingServers {
   if (!ISteamMatchmakingServers_Instance) {
      ISteamMatchmakingServers_Instance = SteamAPI_SteamMatchmakingServers_v002();
   }
   return ISteamMatchmakingServers_Instance;
}
export const SteamAPI_ISteamMatchmakingServers_ReleaseRequest: KoffiFunc<
   (self: ISteamMatchmakingServers, hServerListRequest: Buffer) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServers_ReleaseRequest(ISteamMatchmakingServers * self, HServerListRequest hServerListRequest)"
);
export const SteamAPI_ISteamMatchmakingServers_CancelQuery: KoffiFunc<
   (self: ISteamMatchmakingServers, hRequest: Buffer) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServers_CancelQuery(ISteamMatchmakingServers * self, HServerListRequest hRequest)"
);
export const SteamAPI_ISteamMatchmakingServers_RefreshQuery: KoffiFunc<
   (self: ISteamMatchmakingServers, hRequest: Buffer) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServers_RefreshQuery(ISteamMatchmakingServers * self, HServerListRequest hRequest)"
);
export const SteamAPI_ISteamMatchmakingServers_IsRefreshing: KoffiFunc<
   (self: ISteamMatchmakingServers, hRequest: Buffer) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMatchmakingServers_IsRefreshing(ISteamMatchmakingServers * self, HServerListRequest hRequest)"
);
export const SteamAPI_ISteamMatchmakingServers_GetServerCount: KoffiFunc<
   (self: ISteamMatchmakingServers, hRequest: Buffer) => number
> = lib.cdecl(
   "int SteamAPI_ISteamMatchmakingServers_GetServerCount(ISteamMatchmakingServers * self, HServerListRequest hRequest)"
);
export const SteamAPI_ISteamMatchmakingServers_RefreshServer: KoffiFunc<
   (self: ISteamMatchmakingServers, hRequest: Buffer, iServer: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServers_RefreshServer(ISteamMatchmakingServers * self, HServerListRequest hRequest, int iServer)"
);
export const SteamAPI_ISteamMatchmakingServers_CancelServerQuery: KoffiFunc<
   (self: ISteamMatchmakingServers, hServerQuery: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamMatchmakingServers_CancelServerQuery(ISteamMatchmakingServers * self, HServerQuery hServerQuery)"
);
export interface ISteamGameSearch {
   __brand: "ISteamGameSearch";
}
koffi.opaque("ISteamGameSearch");
export const SteamAPI_SteamGameSearch_v001: KoffiFunc<() => ISteamGameSearch> = lib.cdecl(
   "ISteamGameSearch* SteamAPI_SteamGameSearch_v001()"
);
let ISteamGameSearch_Instance: ISteamGameSearch | null = null;
export function SteamAPI_ISteamGameSearch(): ISteamGameSearch {
   if (!ISteamGameSearch_Instance) {
      ISteamGameSearch_Instance = SteamAPI_SteamGameSearch_v001();
   }
   return ISteamGameSearch_Instance;
}
export const SteamAPI_ISteamGameSearch_AddGameSearchParams: KoffiFunc<
   (self: ISteamGameSearch, pchKeyToFind: string, pchValuesToFind: string) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_AddGameSearchParams(ISteamGameSearch * self, const char * pchKeyToFind, const char * pchValuesToFind)"
);
export const SteamAPI_ISteamGameSearch_SearchForGameWithLobby: KoffiFunc<
   (self: ISteamGameSearch, steamIDLobby: number, nPlayerMin: number, nPlayerMax: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_SearchForGameWithLobby(ISteamGameSearch * self, uint64_steamid steamIDLobby, int nPlayerMin, int nPlayerMax)"
);
export const SteamAPI_ISteamGameSearch_SearchForGameSolo: KoffiFunc<
   (self: ISteamGameSearch, nPlayerMin: number, nPlayerMax: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_SearchForGameSolo(ISteamGameSearch * self, int nPlayerMin, int nPlayerMax)"
);
export const SteamAPI_ISteamGameSearch_AcceptGame: KoffiFunc<(self: ISteamGameSearch) => EGameSearchErrorCode_t> =
   lib.cdecl("EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_AcceptGame(ISteamGameSearch * self)");
export const SteamAPI_ISteamGameSearch_DeclineGame: KoffiFunc<(self: ISteamGameSearch) => EGameSearchErrorCode_t> =
   lib.cdecl("EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_DeclineGame(ISteamGameSearch * self)");
export const SteamAPI_ISteamGameSearch_RetrieveConnectionDetails: KoffiFunc<
   (
      self: ISteamGameSearch,
      steamIDHost: number,
      pchConnectionDetails: [string],
      cubConnectionDetails: number
   ) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_RetrieveConnectionDetails(ISteamGameSearch * self, uint64_steamid steamIDHost, _Out_ char * pchConnectionDetails, int cubConnectionDetails)"
);
export const SteamAPI_ISteamGameSearch_EndGameSearch: KoffiFunc<(self: ISteamGameSearch) => EGameSearchErrorCode_t> =
   lib.cdecl("EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_EndGameSearch(ISteamGameSearch * self)");
export const SteamAPI_ISteamGameSearch_SetGameHostParams: KoffiFunc<
   (self: ISteamGameSearch, pchKey: string, pchValue: string) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_SetGameHostParams(ISteamGameSearch * self, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamGameSearch_SetConnectionDetails: KoffiFunc<
   (self: ISteamGameSearch, pchConnectionDetails: string, cubConnectionDetails: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_SetConnectionDetails(ISteamGameSearch * self, const char * pchConnectionDetails, int cubConnectionDetails)"
);
export const SteamAPI_ISteamGameSearch_RequestPlayersForGame: KoffiFunc<
   (self: ISteamGameSearch, nPlayerMin: number, nPlayerMax: number, nMaxTeamSize: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_RequestPlayersForGame(ISteamGameSearch * self, int nPlayerMin, int nPlayerMax, int nMaxTeamSize)"
);
export const SteamAPI_ISteamGameSearch_HostConfirmGameStart: KoffiFunc<
   (self: ISteamGameSearch, ullUniqueGameID: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_HostConfirmGameStart(ISteamGameSearch * self, uint64 ullUniqueGameID)"
);
export const SteamAPI_ISteamGameSearch_CancelRequestPlayersForGame: KoffiFunc<
   (self: ISteamGameSearch) => EGameSearchErrorCode_t
> = lib.cdecl("EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_CancelRequestPlayersForGame(ISteamGameSearch * self)");
export const SteamAPI_ISteamGameSearch_SubmitPlayerResult: KoffiFunc<
   (
      self: ISteamGameSearch,
      ullUniqueGameID: number,
      steamIDPlayer: number,
      EPlayerResult: EPlayerResult_t
   ) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_SubmitPlayerResult(ISteamGameSearch * self, uint64 ullUniqueGameID, uint64_steamid steamIDPlayer, EPlayerResult_t EPlayerResult)"
);
export const SteamAPI_ISteamGameSearch_EndGame: KoffiFunc<
   (self: ISteamGameSearch, ullUniqueGameID: number) => EGameSearchErrorCode_t
> = lib.cdecl(
   "EGameSearchErrorCode_t SteamAPI_ISteamGameSearch_EndGame(ISteamGameSearch * self, uint64 ullUniqueGameID)"
);
export interface ISteamParties {
   __brand: "ISteamParties";
}
koffi.opaque("ISteamParties");
export const SteamAPI_SteamParties_v002: KoffiFunc<() => ISteamParties> = lib.cdecl(
   "ISteamParties* SteamAPI_SteamParties_v002()"
);
let ISteamParties_Instance: ISteamParties | null = null;
export function SteamAPI_ISteamParties(): ISteamParties {
   if (!ISteamParties_Instance) {
      ISteamParties_Instance = SteamAPI_SteamParties_v002();
   }
   return ISteamParties_Instance;
}
export const SteamAPI_ISteamParties_GetNumActiveBeacons: KoffiFunc<(self: ISteamParties) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamParties_GetNumActiveBeacons(ISteamParties * self)"
);
export const SteamAPI_ISteamParties_GetBeaconByIndex: KoffiFunc<(self: ISteamParties, unIndex: number) => number> =
   lib.cdecl("PartyBeaconID_t SteamAPI_ISteamParties_GetBeaconByIndex(ISteamParties * self, uint32 unIndex)");
export const SteamAPI_ISteamParties_JoinParty: KoffiFunc<(self: ISteamParties, ulBeaconID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamParties_JoinParty(ISteamParties * self, PartyBeaconID_t ulBeaconID)");
export const SteamAPI_ISteamParties_GetNumAvailableBeaconLocations: KoffiFunc<
   (self: ISteamParties, puNumLocations: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamParties_GetNumAvailableBeaconLocations(ISteamParties * self, _Out_ uint32 * puNumLocations)"
);
export const SteamAPI_ISteamParties_OnReservationCompleted: KoffiFunc<
   (self: ISteamParties, ulBeacon: number, steamIDUser: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamParties_OnReservationCompleted(ISteamParties * self, PartyBeaconID_t ulBeacon, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamParties_CancelReservation: KoffiFunc<
   (self: ISteamParties, ulBeacon: number, steamIDUser: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamParties_CancelReservation(ISteamParties * self, PartyBeaconID_t ulBeacon, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamParties_ChangeNumOpenSlots: KoffiFunc<
   (self: ISteamParties, ulBeacon: number, unOpenSlots: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamParties_ChangeNumOpenSlots(ISteamParties * self, PartyBeaconID_t ulBeacon, uint32 unOpenSlots)"
);
export const SteamAPI_ISteamParties_DestroyBeacon: KoffiFunc<(self: ISteamParties, ulBeacon: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamParties_DestroyBeacon(ISteamParties * self, PartyBeaconID_t ulBeacon)");
export interface ISteamRemoteStorage {
   __brand: "ISteamRemoteStorage";
}
koffi.opaque("ISteamRemoteStorage");
export const SteamAPI_SteamRemoteStorage_v016: KoffiFunc<() => ISteamRemoteStorage> = lib.cdecl(
   "ISteamRemoteStorage* SteamAPI_SteamRemoteStorage_v016()"
);
let ISteamRemoteStorage_Instance: ISteamRemoteStorage | null = null;
export function SteamAPI_ISteamRemoteStorage(): ISteamRemoteStorage {
   if (!ISteamRemoteStorage_Instance) {
      ISteamRemoteStorage_Instance = SteamAPI_SteamRemoteStorage_v016();
   }
   return ISteamRemoteStorage_Instance;
}
export const SteamAPI_ISteamRemoteStorage_FileWrite: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string, pvData: Buffer, cubData: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileWrite(ISteamRemoteStorage * self, const char * pchFile, const void * pvData, int32 cubData)"
);
export const SteamAPI_ISteamRemoteStorage_FileRead: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string, pvData: Buffer, cubDataToRead: number) => number
> = lib.cdecl(
   "int32 SteamAPI_ISteamRemoteStorage_FileRead(ISteamRemoteStorage * self, const char * pchFile, _Out_ void * pvData, int32 cubDataToRead)"
);
export const SteamAPI_ISteamRemoteStorage_FileWriteAsync: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string, pvData: Buffer, cubData: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_FileWriteAsync(ISteamRemoteStorage * self, const char * pchFile, const void * pvData, uint32 cubData)"
);
export const SteamAPI_ISteamRemoteStorage_FileReadAsync: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string, nOffset: number, cubToRead: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_FileReadAsync(ISteamRemoteStorage * self, const char * pchFile, uint32 nOffset, uint32 cubToRead)"
);
export const SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete: KoffiFunc<
   (self: ISteamRemoteStorage, hReadCall: number, pvBuffer: Buffer, cubToRead: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileReadAsyncComplete(ISteamRemoteStorage * self, SteamAPICall_t hReadCall, _Out_ void * pvBuffer, uint32 cubToRead)"
);
export const SteamAPI_ISteamRemoteStorage_FileForget: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamRemoteStorage_FileForget(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_FileDelete: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamRemoteStorage_FileDelete(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_FileShare: KoffiFunc<(self: ISteamRemoteStorage, pchFile: string) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamRemoteStorage_FileShare(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_SetSyncPlatforms: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string, eRemoteStoragePlatform: ERemoteStoragePlatform) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_SetSyncPlatforms(ISteamRemoteStorage * self, const char * pchFile, ERemoteStoragePlatform eRemoteStoragePlatform)"
);
export const SteamAPI_ISteamRemoteStorage_FileWriteStreamOpen: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => number
> = lib.cdecl(
   "UGCFileWriteStreamHandle_t SteamAPI_ISteamRemoteStorage_FileWriteStreamOpen(ISteamRemoteStorage * self, const char * pchFile)"
);
export const SteamAPI_ISteamRemoteStorage_FileWriteStreamWriteChunk: KoffiFunc<
   (self: ISteamRemoteStorage, writeHandle: number, pvData: Buffer, cubData: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileWriteStreamWriteChunk(ISteamRemoteStorage * self, UGCFileWriteStreamHandle_t writeHandle, const void * pvData, int32 cubData)"
);
export const SteamAPI_ISteamRemoteStorage_FileWriteStreamClose: KoffiFunc<
   (self: ISteamRemoteStorage, writeHandle: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileWriteStreamClose(ISteamRemoteStorage * self, UGCFileWriteStreamHandle_t writeHandle)"
);
export const SteamAPI_ISteamRemoteStorage_FileWriteStreamCancel: KoffiFunc<
   (self: ISteamRemoteStorage, writeHandle: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_FileWriteStreamCancel(ISteamRemoteStorage * self, UGCFileWriteStreamHandle_t writeHandle)"
);
export const SteamAPI_ISteamRemoteStorage_FileExists: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamRemoteStorage_FileExists(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_FilePersisted: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamRemoteStorage_FilePersisted(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_GetFileSize: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => number
> = lib.cdecl("int32 SteamAPI_ISteamRemoteStorage_GetFileSize(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_GetFileTimestamp: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => number
> = lib.cdecl("int64 SteamAPI_ISteamRemoteStorage_GetFileTimestamp(ISteamRemoteStorage * self, const char * pchFile)");
export const SteamAPI_ISteamRemoteStorage_GetSyncPlatforms: KoffiFunc<
   (self: ISteamRemoteStorage, pchFile: string) => ERemoteStoragePlatform
> = lib.cdecl(
   "ERemoteStoragePlatform SteamAPI_ISteamRemoteStorage_GetSyncPlatforms(ISteamRemoteStorage * self, const char * pchFile)"
);
export const SteamAPI_ISteamRemoteStorage_GetFileCount: KoffiFunc<(self: ISteamRemoteStorage) => number> = lib.cdecl(
   "int32 SteamAPI_ISteamRemoteStorage_GetFileCount(ISteamRemoteStorage * self)"
);
export const SteamAPI_ISteamRemoteStorage_GetFileNameAndSize: KoffiFunc<
   (self: ISteamRemoteStorage, iFile: number, pnFileSizeInBytes: [number]) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamRemoteStorage_GetFileNameAndSize(ISteamRemoteStorage * self, int iFile, _Out_ int32 * pnFileSizeInBytes)"
);
export const SteamAPI_ISteamRemoteStorage_GetQuota: KoffiFunc<
   (self: ISteamRemoteStorage, pnTotalBytes: [number], puAvailableBytes: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_GetQuota(ISteamRemoteStorage * self, _Out_ uint64 * pnTotalBytes, _Out_ uint64 * puAvailableBytes)"
);
export const SteamAPI_ISteamRemoteStorage_IsCloudEnabledForAccount: KoffiFunc<(self: ISteamRemoteStorage) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamRemoteStorage_IsCloudEnabledForAccount(ISteamRemoteStorage * self)");
export const SteamAPI_ISteamRemoteStorage_IsCloudEnabledForApp: KoffiFunc<(self: ISteamRemoteStorage) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamRemoteStorage_IsCloudEnabledForApp(ISteamRemoteStorage * self)");
export const SteamAPI_ISteamRemoteStorage_SetCloudEnabledForApp: KoffiFunc<
   (self: ISteamRemoteStorage, bEnabled: boolean) => void
> = lib.cdecl("void SteamAPI_ISteamRemoteStorage_SetCloudEnabledForApp(ISteamRemoteStorage * self, bool bEnabled)");
export const SteamAPI_ISteamRemoteStorage_UGCDownload: KoffiFunc<
   (self: ISteamRemoteStorage, hContent: number, unPriority: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_UGCDownload(ISteamRemoteStorage * self, UGCHandle_t hContent, uint32 unPriority)"
);
export const SteamAPI_ISteamRemoteStorage_GetUGCDownloadProgress: KoffiFunc<
   (self: ISteamRemoteStorage, hContent: number, pnBytesDownloaded: [number], pnBytesExpected: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_GetUGCDownloadProgress(ISteamRemoteStorage * self, UGCHandle_t hContent, _Out_ int32 * pnBytesDownloaded, _Out_ int32 * pnBytesExpected)"
);
export const SteamAPI_ISteamRemoteStorage_UGCRead: KoffiFunc<
   (
      self: ISteamRemoteStorage,
      hContent: number,
      pvData: Buffer,
      cubDataToRead: number,
      cOffset: number,
      eAction: EUGCReadAction
   ) => number
> = lib.cdecl(
   "int32 SteamAPI_ISteamRemoteStorage_UGCRead(ISteamRemoteStorage * self, UGCHandle_t hContent, _Out_ void * pvData, int32 cubDataToRead, uint32 cOffset, EUGCReadAction eAction)"
);
export const SteamAPI_ISteamRemoteStorage_GetCachedUGCCount: KoffiFunc<(self: ISteamRemoteStorage) => number> =
   lib.cdecl("int32 SteamAPI_ISteamRemoteStorage_GetCachedUGCCount(ISteamRemoteStorage * self)");
export const SteamAPI_ISteamRemoteStorage_GetCachedUGCHandle: KoffiFunc<
   (self: ISteamRemoteStorage, iCachedContent: number) => number
> = lib.cdecl(
   "UGCHandle_t SteamAPI_ISteamRemoteStorage_GetCachedUGCHandle(ISteamRemoteStorage * self, int32 iCachedContent)"
);
export const SteamAPI_ISteamRemoteStorage_CreatePublishedFileUpdateRequest: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "PublishedFileUpdateHandle_t SteamAPI_ISteamRemoteStorage_CreatePublishedFileUpdateRequest(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFileFile: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, pchFile: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFileFile(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, const char * pchFile)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFilePreviewFile: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, pchPreviewFile: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFilePreviewFile(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, const char * pchPreviewFile)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFileTitle: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, pchTitle: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFileTitle(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, const char * pchTitle)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFileDescription: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, pchDescription: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFileDescription(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, const char * pchDescription)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFileVisibility: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, eVisibility: ERemoteStoragePublishedFileVisibility) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFileVisibility(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, ERemoteStoragePublishedFileVisibility eVisibility)"
);
export const SteamAPI_ISteamRemoteStorage_CommitPublishedFileUpdate: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_CommitPublishedFileUpdate(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle)"
);
export const SteamAPI_ISteamRemoteStorage_GetPublishedFileDetails: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number, unMaxSecondsOld: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_GetPublishedFileDetails(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId, uint32 unMaxSecondsOld)"
);
export const SteamAPI_ISteamRemoteStorage_DeletePublishedFile: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_DeletePublishedFile(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_EnumerateUserPublishedFiles: KoffiFunc<
   (self: ISteamRemoteStorage, unStartIndex: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_EnumerateUserPublishedFiles(ISteamRemoteStorage * self, uint32 unStartIndex)"
);
export const SteamAPI_ISteamRemoteStorage_SubscribePublishedFile: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_SubscribePublishedFile(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_EnumerateUserSubscribedFiles: KoffiFunc<
   (self: ISteamRemoteStorage, unStartIndex: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_EnumerateUserSubscribedFiles(ISteamRemoteStorage * self, uint32 unStartIndex)"
);
export const SteamAPI_ISteamRemoteStorage_UnsubscribePublishedFile: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_UnsubscribePublishedFile(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_UpdatePublishedFileSetChangeDescription: KoffiFunc<
   (self: ISteamRemoteStorage, updateHandle: number, pchChangeDescription: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemoteStorage_UpdatePublishedFileSetChangeDescription(ISteamRemoteStorage * self, PublishedFileUpdateHandle_t updateHandle, const char * pchChangeDescription)"
);
export const SteamAPI_ISteamRemoteStorage_GetPublishedItemVoteDetails: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_GetPublishedItemVoteDetails(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_UpdateUserPublishedItemVote: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number, bVoteUp: boolean) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_UpdateUserPublishedItemVote(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId, bool bVoteUp)"
);
export const SteamAPI_ISteamRemoteStorage_GetUserPublishedItemVoteDetails: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_GetUserPublishedItemVoteDetails(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId)"
);
export const SteamAPI_ISteamRemoteStorage_SetUserPublishedFileAction: KoffiFunc<
   (self: ISteamRemoteStorage, unPublishedFileId: number, eAction: EWorkshopFileAction) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_SetUserPublishedFileAction(ISteamRemoteStorage * self, PublishedFileId_t unPublishedFileId, EWorkshopFileAction eAction)"
);
export const SteamAPI_ISteamRemoteStorage_EnumeratePublishedFilesByUserAction: KoffiFunc<
   (self: ISteamRemoteStorage, eAction: EWorkshopFileAction, unStartIndex: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_EnumeratePublishedFilesByUserAction(ISteamRemoteStorage * self, EWorkshopFileAction eAction, uint32 unStartIndex)"
);
export const SteamAPI_ISteamRemoteStorage_UGCDownloadToLocation: KoffiFunc<
   (self: ISteamRemoteStorage, hContent: number, pchLocation: string, unPriority: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamRemoteStorage_UGCDownloadToLocation(ISteamRemoteStorage * self, UGCHandle_t hContent, const char * pchLocation, uint32 unPriority)"
);
export const SteamAPI_ISteamRemoteStorage_GetLocalFileChangeCount: KoffiFunc<(self: ISteamRemoteStorage) => number> =
   lib.cdecl("int32 SteamAPI_ISteamRemoteStorage_GetLocalFileChangeCount(ISteamRemoteStorage * self)");
export const SteamAPI_ISteamRemoteStorage_GetLocalFileChange: KoffiFunc<
   (
      self: ISteamRemoteStorage,
      iFile: number,
      pEChangeType: [ERemoteStorageLocalFileChange],
      pEFilePathType: [ERemoteStorageFilePathType]
   ) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamRemoteStorage_GetLocalFileChange(ISteamRemoteStorage * self, int iFile, _Out_ ERemoteStorageLocalFileChange * pEChangeType, _Out_ ERemoteStorageFilePathType * pEFilePathType)"
);
export const SteamAPI_ISteamRemoteStorage_BeginFileWriteBatch: KoffiFunc<(self: ISteamRemoteStorage) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamRemoteStorage_BeginFileWriteBatch(ISteamRemoteStorage * self)");
export const SteamAPI_ISteamRemoteStorage_EndFileWriteBatch: KoffiFunc<(self: ISteamRemoteStorage) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamRemoteStorage_EndFileWriteBatch(ISteamRemoteStorage * self)");
export interface ISteamUserStats {
   __brand: "ISteamUserStats";
}
koffi.opaque("ISteamUserStats");
export const SteamAPI_SteamUserStats_v012: KoffiFunc<() => ISteamUserStats> = lib.cdecl(
   "ISteamUserStats* SteamAPI_SteamUserStats_v012()"
);
let ISteamUserStats_Instance: ISteamUserStats | null = null;
export function SteamAPI_ISteamUserStats(): ISteamUserStats {
   if (!ISteamUserStats_Instance) {
      ISteamUserStats_Instance = SteamAPI_SteamUserStats_v012();
   }
   return ISteamUserStats_Instance;
}
export const SteamAPI_ISteamUserStats_RequestCurrentStats: KoffiFunc<(self: ISteamUserStats) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_RequestCurrentStats(ISteamUserStats * self)"
);
export const SteamAPI_ISteamUserStats_GetStatInt32: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetStatInt32(ISteamUserStats * self, const char * pchName, _Out_ int32 * pData)"
);
export const SteamAPI_ISteamUserStats_GetStatFloat: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetStatFloat(ISteamUserStats * self, const char * pchName, _Out_ float * pData)"
);
export const SteamAPI_ISteamUserStats_SetStatInt32: KoffiFunc<
   (self: ISteamUserStats, pchName: string, nData: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUserStats_SetStatInt32(ISteamUserStats * self, const char * pchName, int32 nData)");
export const SteamAPI_ISteamUserStats_SetStatFloat: KoffiFunc<
   (self: ISteamUserStats, pchName: string, fData: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUserStats_SetStatFloat(ISteamUserStats * self, const char * pchName, float fData)");
export const SteamAPI_ISteamUserStats_UpdateAvgRateStat: KoffiFunc<
   (self: ISteamUserStats, pchName: string, flCountThisSession: number, dSessionLength: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_UpdateAvgRateStat(ISteamUserStats * self, const char * pchName, float flCountThisSession, double dSessionLength)"
);
export const SteamAPI_ISteamUserStats_GetAchievement: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pbAchieved: [boolean]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetAchievement(ISteamUserStats * self, const char * pchName, _Out_ bool * pbAchieved)"
);
export const SteamAPI_ISteamUserStats_SetAchievement: KoffiFunc<(self: ISteamUserStats, pchName: string) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUserStats_SetAchievement(ISteamUserStats * self, const char * pchName)");
export const SteamAPI_ISteamUserStats_ClearAchievement: KoffiFunc<(self: ISteamUserStats, pchName: string) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUserStats_ClearAchievement(ISteamUserStats * self, const char * pchName)");
export const SteamAPI_ISteamUserStats_GetAchievementAndUnlockTime: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pbAchieved: [boolean], punUnlockTime: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetAchievementAndUnlockTime(ISteamUserStats * self, const char * pchName, _Out_ bool * pbAchieved, _Out_ uint32 * punUnlockTime)"
);
export const SteamAPI_ISteamUserStats_StoreStats: KoffiFunc<(self: ISteamUserStats) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_StoreStats(ISteamUserStats * self)"
);
export const SteamAPI_ISteamUserStats_GetAchievementIcon: KoffiFunc<
   (self: ISteamUserStats, pchName: string) => number
> = lib.cdecl("int SteamAPI_ISteamUserStats_GetAchievementIcon(ISteamUserStats * self, const char * pchName)");
export const SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pchKey: string) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamUserStats_GetAchievementDisplayAttribute(ISteamUserStats * self, const char * pchName, const char * pchKey)"
);
export const SteamAPI_ISteamUserStats_IndicateAchievementProgress: KoffiFunc<
   (self: ISteamUserStats, pchName: string, nCurProgress: number, nMaxProgress: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_IndicateAchievementProgress(ISteamUserStats * self, const char * pchName, uint32 nCurProgress, uint32 nMaxProgress)"
);
export const SteamAPI_ISteamUserStats_GetNumAchievements: KoffiFunc<(self: ISteamUserStats) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUserStats_GetNumAchievements(ISteamUserStats * self)"
);
export const SteamAPI_ISteamUserStats_GetAchievementName: KoffiFunc<
   (self: ISteamUserStats, iAchievement: number) => string
> = lib.cdecl("const char * SteamAPI_ISteamUserStats_GetAchievementName(ISteamUserStats * self, uint32 iAchievement)");
export const SteamAPI_ISteamUserStats_RequestUserStats: KoffiFunc<
   (self: ISteamUserStats, steamIDUser: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_RequestUserStats(ISteamUserStats * self, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamUserStats_GetUserStatInt32: KoffiFunc<
   (self: ISteamUserStats, steamIDUser: number, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetUserStatInt32(ISteamUserStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ int32 * pData)"
);
export const SteamAPI_ISteamUserStats_GetUserStatFloat: KoffiFunc<
   (self: ISteamUserStats, steamIDUser: number, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetUserStatFloat(ISteamUserStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ float * pData)"
);
export const SteamAPI_ISteamUserStats_GetUserAchievement: KoffiFunc<
   (self: ISteamUserStats, steamIDUser: number, pchName: string, pbAchieved: [boolean]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetUserAchievement(ISteamUserStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ bool * pbAchieved)"
);
export const SteamAPI_ISteamUserStats_GetUserAchievementAndUnlockTime: KoffiFunc<
   (
      self: ISteamUserStats,
      steamIDUser: number,
      pchName: string,
      pbAchieved: [boolean],
      punUnlockTime: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetUserAchievementAndUnlockTime(ISteamUserStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ bool * pbAchieved, _Out_ uint32 * punUnlockTime)"
);
export const SteamAPI_ISteamUserStats_ResetAllStats: KoffiFunc<
   (self: ISteamUserStats, bAchievementsToo: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUserStats_ResetAllStats(ISteamUserStats * self, bool bAchievementsToo)");
export const SteamAPI_ISteamUserStats_FindOrCreateLeaderboard: KoffiFunc<
   (
      self: ISteamUserStats,
      pchLeaderboardName: string,
      eLeaderboardSortMethod: ELeaderboardSortMethod,
      eLeaderboardDisplayType: ELeaderboardDisplayType
   ) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_FindOrCreateLeaderboard(ISteamUserStats * self, const char * pchLeaderboardName, ELeaderboardSortMethod eLeaderboardSortMethod, ELeaderboardDisplayType eLeaderboardDisplayType)"
);
export const SteamAPI_ISteamUserStats_FindLeaderboard: KoffiFunc<
   (self: ISteamUserStats, pchLeaderboardName: string) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_FindLeaderboard(ISteamUserStats * self, const char * pchLeaderboardName)"
);
export const SteamAPI_ISteamUserStats_GetLeaderboardName: KoffiFunc<
   (self: ISteamUserStats, hSteamLeaderboard: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamUserStats_GetLeaderboardName(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard)"
);
export const SteamAPI_ISteamUserStats_GetLeaderboardEntryCount: KoffiFunc<
   (self: ISteamUserStats, hSteamLeaderboard: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamUserStats_GetLeaderboardEntryCount(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard)"
);
export const SteamAPI_ISteamUserStats_GetLeaderboardSortMethod: KoffiFunc<
   (self: ISteamUserStats, hSteamLeaderboard: number) => ELeaderboardSortMethod
> = lib.cdecl(
   "ELeaderboardSortMethod SteamAPI_ISteamUserStats_GetLeaderboardSortMethod(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard)"
);
export const SteamAPI_ISteamUserStats_GetLeaderboardDisplayType: KoffiFunc<
   (self: ISteamUserStats, hSteamLeaderboard: number) => ELeaderboardDisplayType
> = lib.cdecl(
   "ELeaderboardDisplayType SteamAPI_ISteamUserStats_GetLeaderboardDisplayType(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard)"
);
export const SteamAPI_ISteamUserStats_DownloadLeaderboardEntries: KoffiFunc<
   (
      self: ISteamUserStats,
      hSteamLeaderboard: number,
      eLeaderboardDataRequest: ELeaderboardDataRequest,
      nRangeStart: number,
      nRangeEnd: number
   ) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_DownloadLeaderboardEntries(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard, ELeaderboardDataRequest eLeaderboardDataRequest, int nRangeStart, int nRangeEnd)"
);
export const SteamAPI_ISteamUserStats_UploadLeaderboardScore: KoffiFunc<
   (
      self: ISteamUserStats,
      hSteamLeaderboard: number,
      eLeaderboardUploadScoreMethod: ELeaderboardUploadScoreMethod,
      nScore: number,
      pScoreDetails: number,
      cScoreDetailsCount: number
   ) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_UploadLeaderboardScore(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard, ELeaderboardUploadScoreMethod eLeaderboardUploadScoreMethod, int32 nScore, const int32 * pScoreDetails, int cScoreDetailsCount)"
);
export const SteamAPI_ISteamUserStats_AttachLeaderboardUGC: KoffiFunc<
   (self: ISteamUserStats, hSteamLeaderboard: number, hUGC: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUserStats_AttachLeaderboardUGC(ISteamUserStats * self, SteamLeaderboard_t hSteamLeaderboard, UGCHandle_t hUGC)"
);
export const SteamAPI_ISteamUserStats_GetNumberOfCurrentPlayers: KoffiFunc<(self: ISteamUserStats) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUserStats_GetNumberOfCurrentPlayers(ISteamUserStats * self)");
export const SteamAPI_ISteamUserStats_RequestGlobalAchievementPercentages: KoffiFunc<
   (self: ISteamUserStats) => number
> = lib.cdecl("SteamAPICall_t SteamAPI_ISteamUserStats_RequestGlobalAchievementPercentages(ISteamUserStats * self)");
export const SteamAPI_ISteamUserStats_GetMostAchievedAchievementInfo: KoffiFunc<
   (
      self: ISteamUserStats,
      pchName: [string],
      unNameBufLen: number,
      pflPercent: [number],
      pbAchieved: [boolean]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamUserStats_GetMostAchievedAchievementInfo(ISteamUserStats * self, _Out_ char * pchName, uint32 unNameBufLen, _Out_ float * pflPercent, _Out_ bool * pbAchieved)"
);
export const SteamAPI_ISteamUserStats_GetNextMostAchievedAchievementInfo: KoffiFunc<
   (
      self: ISteamUserStats,
      iIteratorPrevious: number,
      pchName: [string],
      unNameBufLen: number,
      pflPercent: [number],
      pbAchieved: [boolean]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamUserStats_GetNextMostAchievedAchievementInfo(ISteamUserStats * self, int iIteratorPrevious, _Out_ char * pchName, uint32 unNameBufLen, _Out_ float * pflPercent, _Out_ bool * pbAchieved)"
);
export const SteamAPI_ISteamUserStats_GetAchievementAchievedPercent: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pflPercent: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetAchievementAchievedPercent(ISteamUserStats * self, const char * pchName, _Out_ float * pflPercent)"
);
export const SteamAPI_ISteamUserStats_RequestGlobalStats: KoffiFunc<
   (self: ISteamUserStats, nHistoryDays: number) => number
> = lib.cdecl("SteamAPICall_t SteamAPI_ISteamUserStats_RequestGlobalStats(ISteamUserStats * self, int nHistoryDays)");
export const SteamAPI_ISteamUserStats_GetGlobalStatInt64: KoffiFunc<
   (self: ISteamUserStats, pchStatName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetGlobalStatInt64(ISteamUserStats * self, const char * pchStatName, _Out_ int64 * pData)"
);
export const SteamAPI_ISteamUserStats_GetGlobalStatDouble: KoffiFunc<
   (self: ISteamUserStats, pchStatName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetGlobalStatDouble(ISteamUserStats * self, const char * pchStatName, _Out_ double * pData)"
);
export const SteamAPI_ISteamUserStats_GetGlobalStatHistoryInt64: KoffiFunc<
   (self: ISteamUserStats, pchStatName: string, pData: [number], cubData: number) => number
> = lib.cdecl(
   "int32 SteamAPI_ISteamUserStats_GetGlobalStatHistoryInt64(ISteamUserStats * self, const char * pchStatName, _Out_ int64 * pData, uint32 cubData)"
);
export const SteamAPI_ISteamUserStats_GetGlobalStatHistoryDouble: KoffiFunc<
   (self: ISteamUserStats, pchStatName: string, pData: [number], cubData: number) => number
> = lib.cdecl(
   "int32 SteamAPI_ISteamUserStats_GetGlobalStatHistoryDouble(ISteamUserStats * self, const char * pchStatName, _Out_ double * pData, uint32 cubData)"
);
export const SteamAPI_ISteamUserStats_GetAchievementProgressLimitsInt32: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pnMinProgress: [number], pnMaxProgress: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetAchievementProgressLimitsInt32(ISteamUserStats * self, const char * pchName, _Out_ int32 * pnMinProgress, _Out_ int32 * pnMaxProgress)"
);
export const SteamAPI_ISteamUserStats_GetAchievementProgressLimitsFloat: KoffiFunc<
   (self: ISteamUserStats, pchName: string, pfMinProgress: [number], pfMaxProgress: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUserStats_GetAchievementProgressLimitsFloat(ISteamUserStats * self, const char * pchName, _Out_ float * pfMinProgress, _Out_ float * pfMaxProgress)"
);
export interface ISteamApps {
   __brand: "ISteamApps";
}
koffi.opaque("ISteamApps");
export const SteamAPI_SteamApps_v008: KoffiFunc<() => ISteamApps> = lib.cdecl("ISteamApps* SteamAPI_SteamApps_v008()");
let ISteamApps_Instance: ISteamApps | null = null;
export function SteamAPI_ISteamApps(): ISteamApps {
   if (!ISteamApps_Instance) {
      ISteamApps_Instance = SteamAPI_SteamApps_v008();
   }
   return ISteamApps_Instance;
}
export const SteamAPI_ISteamApps_BIsSubscribed: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsSubscribed(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BIsLowViolence: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsLowViolence(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BIsCybercafe: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsCybercafe(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BIsVACBanned: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsVACBanned(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_GetCurrentGameLanguage: KoffiFunc<(self: ISteamApps) => string> = lib.cdecl(
   "const char * SteamAPI_ISteamApps_GetCurrentGameLanguage(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_GetAvailableGameLanguages: KoffiFunc<(self: ISteamApps) => string> = lib.cdecl(
   "const char * SteamAPI_ISteamApps_GetAvailableGameLanguages(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BIsSubscribedApp: KoffiFunc<(self: ISteamApps, appID: number) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsSubscribedApp(ISteamApps * self, AppId_t appID)"
);
export const SteamAPI_ISteamApps_BIsDlcInstalled: KoffiFunc<(self: ISteamApps, appID: number) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsDlcInstalled(ISteamApps * self, AppId_t appID)"
);
export const SteamAPI_ISteamApps_GetEarliestPurchaseUnixTime: KoffiFunc<(self: ISteamApps, nAppID: number) => number> =
   lib.cdecl("uint32 SteamAPI_ISteamApps_GetEarliestPurchaseUnixTime(ISteamApps * self, AppId_t nAppID)");
export const SteamAPI_ISteamApps_BIsSubscribedFromFreeWeekend: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsSubscribedFromFreeWeekend(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_GetDLCCount: KoffiFunc<(self: ISteamApps) => number> = lib.cdecl(
   "int SteamAPI_ISteamApps_GetDLCCount(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BGetDLCDataByIndex: KoffiFunc<
   (
      self: ISteamApps,
      iDLC: number,
      pAppID: [number],
      pbAvailable: [boolean],
      pchName: [string],
      cchNameBufferSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BGetDLCDataByIndex(ISteamApps * self, int iDLC, _Out_ AppId_t * pAppID, _Out_ bool * pbAvailable, _Out_ char * pchName, int cchNameBufferSize)"
);
export const SteamAPI_ISteamApps_InstallDLC: KoffiFunc<(self: ISteamApps, nAppID: number) => void> = lib.cdecl(
   "void SteamAPI_ISteamApps_InstallDLC(ISteamApps * self, AppId_t nAppID)"
);
export const SteamAPI_ISteamApps_UninstallDLC: KoffiFunc<(self: ISteamApps, nAppID: number) => void> = lib.cdecl(
   "void SteamAPI_ISteamApps_UninstallDLC(ISteamApps * self, AppId_t nAppID)"
);
export const SteamAPI_ISteamApps_RequestAppProofOfPurchaseKey: KoffiFunc<(self: ISteamApps, nAppID: number) => void> =
   lib.cdecl("void SteamAPI_ISteamApps_RequestAppProofOfPurchaseKey(ISteamApps * self, AppId_t nAppID)");
export const SteamAPI_ISteamApps_GetCurrentBetaName: KoffiFunc<
   (self: ISteamApps, pchName: [string], cchNameBufferSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamApps_GetCurrentBetaName(ISteamApps * self, _Out_ char * pchName, int cchNameBufferSize)"
);
export const SteamAPI_ISteamApps_MarkContentCorrupt: KoffiFunc<
   (self: ISteamApps, bMissingFilesOnly: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamApps_MarkContentCorrupt(ISteamApps * self, bool bMissingFilesOnly)");
export const SteamAPI_ISteamApps_GetInstalledDepots: KoffiFunc<
   (self: ISteamApps, appID: number, pvecDepots: [number], cMaxDepots: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamApps_GetInstalledDepots(ISteamApps * self, AppId_t appID, _Out_ DepotId_t * pvecDepots, uint32 cMaxDepots)"
);
export const SteamAPI_ISteamApps_GetAppInstallDir: KoffiFunc<
   (self: ISteamApps, appID: number, pchFolder: [string], cchFolderBufferSize: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamApps_GetAppInstallDir(ISteamApps * self, AppId_t appID, _Out_ char * pchFolder, uint32 cchFolderBufferSize)"
);
export const SteamAPI_ISteamApps_BIsAppInstalled: KoffiFunc<(self: ISteamApps, appID: number) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsAppInstalled(ISteamApps * self, AppId_t appID)"
);
export const SteamAPI_ISteamApps_GetAppOwner: KoffiFunc<(self: ISteamApps) => number> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamApps_GetAppOwner(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_GetLaunchQueryParam: KoffiFunc<(self: ISteamApps, pchKey: string) => string> =
   lib.cdecl("const char * SteamAPI_ISteamApps_GetLaunchQueryParam(ISteamApps * self, const char * pchKey)");
export const SteamAPI_ISteamApps_GetDlcDownloadProgress: KoffiFunc<
   (self: ISteamApps, nAppID: number, punBytesDownloaded: [number], punBytesTotal: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamApps_GetDlcDownloadProgress(ISteamApps * self, AppId_t nAppID, _Out_ uint64 * punBytesDownloaded, _Out_ uint64 * punBytesTotal)"
);
export const SteamAPI_ISteamApps_GetAppBuildId: KoffiFunc<(self: ISteamApps) => number> = lib.cdecl(
   "int SteamAPI_ISteamApps_GetAppBuildId(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_RequestAllProofOfPurchaseKeys: KoffiFunc<(self: ISteamApps) => void> = lib.cdecl(
   "void SteamAPI_ISteamApps_RequestAllProofOfPurchaseKeys(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_GetFileDetails: KoffiFunc<(self: ISteamApps, pszFileName: string) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamApps_GetFileDetails(ISteamApps * self, const char * pszFileName)");
export const SteamAPI_ISteamApps_GetLaunchCommandLine: KoffiFunc<
   (self: ISteamApps, pszCommandLine: [string], cubCommandLine: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamApps_GetLaunchCommandLine(ISteamApps * self, _Out_ char * pszCommandLine, int cubCommandLine)"
);
export const SteamAPI_ISteamApps_BIsSubscribedFromFamilySharing: KoffiFunc<(self: ISteamApps) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsSubscribedFromFamilySharing(ISteamApps * self)"
);
export const SteamAPI_ISteamApps_BIsTimedTrial: KoffiFunc<
   (self: ISteamApps, punSecondsAllowed: [number], punSecondsPlayed: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamApps_BIsTimedTrial(ISteamApps * self, _Out_ uint32 * punSecondsAllowed, _Out_ uint32 * punSecondsPlayed)"
);
export interface ISteamNetworking {
   __brand: "ISteamNetworking";
}
koffi.opaque("ISteamNetworking");
export const SteamAPI_SteamNetworking_v006: KoffiFunc<() => ISteamNetworking> = lib.cdecl(
   "ISteamNetworking* SteamAPI_SteamNetworking_v006()"
);
let ISteamNetworking_Instance: ISteamNetworking | null = null;
export function SteamAPI_ISteamNetworking(): ISteamNetworking {
   if (!ISteamNetworking_Instance) {
      ISteamNetworking_Instance = SteamAPI_SteamNetworking_v006();
   }
   return ISteamNetworking_Instance;
}
export const SteamAPI_ISteamNetworking_SendP2PPacket: KoffiFunc<
   (
      self: ISteamNetworking,
      steamIDRemote: number,
      pubData: Buffer,
      cubData: number,
      eP2PSendType: EP2PSend,
      nChannel: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_SendP2PPacket(ISteamNetworking * self, uint64_steamid steamIDRemote, const void * pubData, uint32 cubData, EP2PSend eP2PSendType, int nChannel)"
);
export const SteamAPI_ISteamNetworking_IsP2PPacketAvailable: KoffiFunc<
   (self: ISteamNetworking, pcubMsgSize: [number], nChannel: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_IsP2PPacketAvailable(ISteamNetworking * self, _Out_ uint32 * pcubMsgSize, int nChannel)"
);
export const SteamAPI_ISteamNetworking_AcceptP2PSessionWithUser: KoffiFunc<
   (self: ISteamNetworking, steamIDRemote: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_AcceptP2PSessionWithUser(ISteamNetworking * self, uint64_steamid steamIDRemote)"
);
export const SteamAPI_ISteamNetworking_CloseP2PSessionWithUser: KoffiFunc<
   (self: ISteamNetworking, steamIDRemote: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_CloseP2PSessionWithUser(ISteamNetworking * self, uint64_steamid steamIDRemote)"
);
export const SteamAPI_ISteamNetworking_CloseP2PChannelWithUser: KoffiFunc<
   (self: ISteamNetworking, steamIDRemote: number, nChannel: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_CloseP2PChannelWithUser(ISteamNetworking * self, uint64_steamid steamIDRemote, int nChannel)"
);
export const SteamAPI_ISteamNetworking_AllowP2PPacketRelay: KoffiFunc<
   (self: ISteamNetworking, bAllow: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamNetworking_AllowP2PPacketRelay(ISteamNetworking * self, bool bAllow)");
export const SteamAPI_ISteamNetworking_CreateP2PConnectionSocket: KoffiFunc<
   (
      self: ISteamNetworking,
      steamIDTarget: number,
      nVirtualPort: number,
      nTimeoutSec: number,
      bAllowUseOfPacketRelay: boolean
   ) => number
> = lib.cdecl(
   "SNetSocket_t SteamAPI_ISteamNetworking_CreateP2PConnectionSocket(ISteamNetworking * self, uint64_steamid steamIDTarget, int nVirtualPort, int nTimeoutSec, bool bAllowUseOfPacketRelay)"
);
export const SteamAPI_ISteamNetworking_DestroySocket: KoffiFunc<
   (self: ISteamNetworking, hSocket: number, bNotifyRemoteEnd: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_DestroySocket(ISteamNetworking * self, SNetSocket_t hSocket, bool bNotifyRemoteEnd)"
);
export const SteamAPI_ISteamNetworking_DestroyListenSocket: KoffiFunc<
   (self: ISteamNetworking, hSocket: number, bNotifyRemoteEnd: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_DestroyListenSocket(ISteamNetworking * self, SNetListenSocket_t hSocket, bool bNotifyRemoteEnd)"
);
export const SteamAPI_ISteamNetworking_SendDataOnSocket: KoffiFunc<
   (self: ISteamNetworking, hSocket: number, pubData: Buffer, cubData: number, bReliable: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_SendDataOnSocket(ISteamNetworking * self, SNetSocket_t hSocket, _Out_ void * pubData, uint32 cubData, bool bReliable)"
);
export const SteamAPI_ISteamNetworking_IsDataAvailableOnSocket: KoffiFunc<
   (self: ISteamNetworking, hSocket: number, pcubMsgSize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_IsDataAvailableOnSocket(ISteamNetworking * self, SNetSocket_t hSocket, _Out_ uint32 * pcubMsgSize)"
);
export const SteamAPI_ISteamNetworking_RetrieveDataFromSocket: KoffiFunc<
   (self: ISteamNetworking, hSocket: number, pubDest: Buffer, cubDest: number, pcubMsgSize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_RetrieveDataFromSocket(ISteamNetworking * self, SNetSocket_t hSocket, _Out_ void * pubDest, uint32 cubDest, _Out_ uint32 * pcubMsgSize)"
);
export const SteamAPI_ISteamNetworking_IsDataAvailable: KoffiFunc<
   (self: ISteamNetworking, hListenSocket: number, pcubMsgSize: [number], phSocket: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_IsDataAvailable(ISteamNetworking * self, SNetListenSocket_t hListenSocket, _Out_ uint32 * pcubMsgSize, _Out_ SNetSocket_t * phSocket)"
);
export const SteamAPI_ISteamNetworking_RetrieveData: KoffiFunc<
   (
      self: ISteamNetworking,
      hListenSocket: number,
      pubDest: Buffer,
      cubDest: number,
      pcubMsgSize: [number],
      phSocket: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworking_RetrieveData(ISteamNetworking * self, SNetListenSocket_t hListenSocket, _Out_ void * pubDest, uint32 cubDest, _Out_ uint32 * pcubMsgSize, _Out_ SNetSocket_t * phSocket)"
);
export const SteamAPI_ISteamNetworking_GetSocketConnectionType: KoffiFunc<
   (self: ISteamNetworking, hSocket: number) => ESNetSocketConnectionType
> = lib.cdecl(
   "ESNetSocketConnectionType SteamAPI_ISteamNetworking_GetSocketConnectionType(ISteamNetworking * self, SNetSocket_t hSocket)"
);
export const SteamAPI_ISteamNetworking_GetMaxPacketSize: KoffiFunc<
   (self: ISteamNetworking, hSocket: number) => number
> = lib.cdecl("int SteamAPI_ISteamNetworking_GetMaxPacketSize(ISteamNetworking * self, SNetSocket_t hSocket)");
export interface ISteamScreenshots {
   __brand: "ISteamScreenshots";
}
koffi.opaque("ISteamScreenshots");
export const SteamAPI_SteamScreenshots_v003: KoffiFunc<() => ISteamScreenshots> = lib.cdecl(
   "ISteamScreenshots* SteamAPI_SteamScreenshots_v003()"
);
let ISteamScreenshots_Instance: ISteamScreenshots | null = null;
export function SteamAPI_ISteamScreenshots(): ISteamScreenshots {
   if (!ISteamScreenshots_Instance) {
      ISteamScreenshots_Instance = SteamAPI_SteamScreenshots_v003();
   }
   return ISteamScreenshots_Instance;
}
export const SteamAPI_ISteamScreenshots_WriteScreenshot: KoffiFunc<
   (self: ISteamScreenshots, pubRGB: Buffer, cubRGB: number, nWidth: number, nHeight: number) => number
> = lib.cdecl(
   "ScreenshotHandle SteamAPI_ISteamScreenshots_WriteScreenshot(ISteamScreenshots * self, _Out_ void * pubRGB, uint32 cubRGB, int nWidth, int nHeight)"
);
export const SteamAPI_ISteamScreenshots_AddScreenshotToLibrary: KoffiFunc<
   (
      self: ISteamScreenshots,
      pchFilename: string,
      pchThumbnailFilename: string,
      nWidth: number,
      nHeight: number
   ) => number
> = lib.cdecl(
   "ScreenshotHandle SteamAPI_ISteamScreenshots_AddScreenshotToLibrary(ISteamScreenshots * self, const char * pchFilename, const char * pchThumbnailFilename, int nWidth, int nHeight)"
);
export const SteamAPI_ISteamScreenshots_TriggerScreenshot: KoffiFunc<(self: ISteamScreenshots) => void> = lib.cdecl(
   "void SteamAPI_ISteamScreenshots_TriggerScreenshot(ISteamScreenshots * self)"
);
export const SteamAPI_ISteamScreenshots_HookScreenshots: KoffiFunc<(self: ISteamScreenshots, bHook: boolean) => void> =
   lib.cdecl("void SteamAPI_ISteamScreenshots_HookScreenshots(ISteamScreenshots * self, bool bHook)");
export const SteamAPI_ISteamScreenshots_SetLocation: KoffiFunc<
   (self: ISteamScreenshots, hScreenshot: number, pchLocation: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamScreenshots_SetLocation(ISteamScreenshots * self, ScreenshotHandle hScreenshot, const char * pchLocation)"
);
export const SteamAPI_ISteamScreenshots_TagUser: KoffiFunc<
   (self: ISteamScreenshots, hScreenshot: number, steamID: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamScreenshots_TagUser(ISteamScreenshots * self, ScreenshotHandle hScreenshot, uint64_steamid steamID)"
);
export const SteamAPI_ISteamScreenshots_TagPublishedFile: KoffiFunc<
   (self: ISteamScreenshots, hScreenshot: number, unPublishedFileID: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamScreenshots_TagPublishedFile(ISteamScreenshots * self, ScreenshotHandle hScreenshot, PublishedFileId_t unPublishedFileID)"
);
export const SteamAPI_ISteamScreenshots_IsScreenshotsHooked: KoffiFunc<(self: ISteamScreenshots) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamScreenshots_IsScreenshotsHooked(ISteamScreenshots * self)");
export const SteamAPI_ISteamScreenshots_AddVRScreenshotToLibrary: KoffiFunc<
   (self: ISteamScreenshots, eType: EVRScreenshotType, pchFilename: string, pchVRFilename: string) => number
> = lib.cdecl(
   "ScreenshotHandle SteamAPI_ISteamScreenshots_AddVRScreenshotToLibrary(ISteamScreenshots * self, EVRScreenshotType eType, const char * pchFilename, const char * pchVRFilename)"
);
export interface ISteamMusic {
   __brand: "ISteamMusic";
}
koffi.opaque("ISteamMusic");
export const SteamAPI_SteamMusic_v001: KoffiFunc<() => ISteamMusic> = lib.cdecl(
   "ISteamMusic* SteamAPI_SteamMusic_v001()"
);
let ISteamMusic_Instance: ISteamMusic | null = null;
export function SteamAPI_ISteamMusic(): ISteamMusic {
   if (!ISteamMusic_Instance) {
      ISteamMusic_Instance = SteamAPI_SteamMusic_v001();
   }
   return ISteamMusic_Instance;
}
export const SteamAPI_ISteamMusic_BIsEnabled: KoffiFunc<(self: ISteamMusic) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusic_BIsEnabled(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_BIsPlaying: KoffiFunc<(self: ISteamMusic) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusic_BIsPlaying(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_GetPlaybackStatus: KoffiFunc<(self: ISteamMusic) => AudioPlayback_Status> = lib.cdecl(
   "AudioPlayback_Status SteamAPI_ISteamMusic_GetPlaybackStatus(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_Play: KoffiFunc<(self: ISteamMusic) => void> = lib.cdecl(
   "void SteamAPI_ISteamMusic_Play(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_Pause: KoffiFunc<(self: ISteamMusic) => void> = lib.cdecl(
   "void SteamAPI_ISteamMusic_Pause(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_PlayPrevious: KoffiFunc<(self: ISteamMusic) => void> = lib.cdecl(
   "void SteamAPI_ISteamMusic_PlayPrevious(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_PlayNext: KoffiFunc<(self: ISteamMusic) => void> = lib.cdecl(
   "void SteamAPI_ISteamMusic_PlayNext(ISteamMusic * self)"
);
export const SteamAPI_ISteamMusic_SetVolume: KoffiFunc<(self: ISteamMusic, flVolume: number) => void> = lib.cdecl(
   "void SteamAPI_ISteamMusic_SetVolume(ISteamMusic * self, float flVolume)"
);
export const SteamAPI_ISteamMusic_GetVolume: KoffiFunc<(self: ISteamMusic) => number> = lib.cdecl(
   "float SteamAPI_ISteamMusic_GetVolume(ISteamMusic * self)"
);
export interface ISteamMusicRemote {
   __brand: "ISteamMusicRemote";
}
koffi.opaque("ISteamMusicRemote");
export const SteamAPI_SteamMusicRemote_v001: KoffiFunc<() => ISteamMusicRemote> = lib.cdecl(
   "ISteamMusicRemote* SteamAPI_SteamMusicRemote_v001()"
);
let ISteamMusicRemote_Instance: ISteamMusicRemote | null = null;
export function SteamAPI_ISteamMusicRemote(): ISteamMusicRemote {
   if (!ISteamMusicRemote_Instance) {
      ISteamMusicRemote_Instance = SteamAPI_SteamMusicRemote_v001();
   }
   return ISteamMusicRemote_Instance;
}
export const SteamAPI_ISteamMusicRemote_RegisterSteamMusicRemote: KoffiFunc<
   (self: ISteamMusicRemote, pchName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_RegisterSteamMusicRemote(ISteamMusicRemote * self, const char * pchName)"
);
export const SteamAPI_ISteamMusicRemote_DeregisterSteamMusicRemote: KoffiFunc<(self: ISteamMusicRemote) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_DeregisterSteamMusicRemote(ISteamMusicRemote * self)");
export const SteamAPI_ISteamMusicRemote_BIsCurrentMusicRemote: KoffiFunc<(self: ISteamMusicRemote) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_BIsCurrentMusicRemote(ISteamMusicRemote * self)");
export const SteamAPI_ISteamMusicRemote_BActivationSuccess: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_BActivationSuccess(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_SetDisplayName: KoffiFunc<
   (self: ISteamMusicRemote, pchDisplayName: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_SetDisplayName(ISteamMusicRemote * self, const char * pchDisplayName)");
export const SteamAPI_ISteamMusicRemote_SetPNGIcon_64x64: KoffiFunc<
   (self: ISteamMusicRemote, pvBuffer: Buffer, cbBufferLength: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_SetPNGIcon_64x64(ISteamMusicRemote * self, _Out_ void * pvBuffer, uint32 cbBufferLength)"
);
export const SteamAPI_ISteamMusicRemote_EnablePlayPrevious: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnablePlayPrevious(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_EnablePlayNext: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnablePlayNext(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_EnableShuffled: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnableShuffled(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_EnableLooped: KoffiFunc<(self: ISteamMusicRemote, bValue: boolean) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnableLooped(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_EnableQueue: KoffiFunc<(self: ISteamMusicRemote, bValue: boolean) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnableQueue(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_EnablePlaylists: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_EnablePlaylists(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_UpdatePlaybackStatus: KoffiFunc<
   (self: ISteamMusicRemote, nStatus: AudioPlayback_Status) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_UpdatePlaybackStatus(ISteamMusicRemote * self, AudioPlayback_Status nStatus)"
);
export const SteamAPI_ISteamMusicRemote_UpdateShuffled: KoffiFunc<
   (self: ISteamMusicRemote, bValue: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_UpdateShuffled(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_UpdateLooped: KoffiFunc<(self: ISteamMusicRemote, bValue: boolean) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_UpdateLooped(ISteamMusicRemote * self, bool bValue)");
export const SteamAPI_ISteamMusicRemote_UpdateVolume: KoffiFunc<(self: ISteamMusicRemote, flValue: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_UpdateVolume(ISteamMusicRemote * self, float flValue)");
export const SteamAPI_ISteamMusicRemote_CurrentEntryWillChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_CurrentEntryWillChange(ISteamMusicRemote * self)");
export const SteamAPI_ISteamMusicRemote_CurrentEntryIsAvailable: KoffiFunc<
   (self: ISteamMusicRemote, bAvailable: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_CurrentEntryIsAvailable(ISteamMusicRemote * self, bool bAvailable)");
export const SteamAPI_ISteamMusicRemote_UpdateCurrentEntryText: KoffiFunc<
   (self: ISteamMusicRemote, pchText: string) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_UpdateCurrentEntryText(ISteamMusicRemote * self, const char * pchText)");
export const SteamAPI_ISteamMusicRemote_UpdateCurrentEntryElapsedSeconds: KoffiFunc<
   (self: ISteamMusicRemote, nValue: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_UpdateCurrentEntryElapsedSeconds(ISteamMusicRemote * self, int nValue)");
export const SteamAPI_ISteamMusicRemote_UpdateCurrentEntryCoverArt: KoffiFunc<
   (self: ISteamMusicRemote, pvBuffer: Buffer, cbBufferLength: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_UpdateCurrentEntryCoverArt(ISteamMusicRemote * self, _Out_ void * pvBuffer, uint32 cbBufferLength)"
);
export const SteamAPI_ISteamMusicRemote_CurrentEntryDidChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_CurrentEntryDidChange(ISteamMusicRemote * self)");
export const SteamAPI_ISteamMusicRemote_QueueWillChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_QueueWillChange(ISteamMusicRemote * self)"
);
export const SteamAPI_ISteamMusicRemote_ResetQueueEntries: KoffiFunc<(self: ISteamMusicRemote) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_ResetQueueEntries(ISteamMusicRemote * self)"
);
export const SteamAPI_ISteamMusicRemote_SetQueueEntry: KoffiFunc<
   (self: ISteamMusicRemote, nID: number, nPosition: number, pchEntryText: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_SetQueueEntry(ISteamMusicRemote * self, int nID, int nPosition, const char * pchEntryText)"
);
export const SteamAPI_ISteamMusicRemote_SetCurrentQueueEntry: KoffiFunc<
   (self: ISteamMusicRemote, nID: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_SetCurrentQueueEntry(ISteamMusicRemote * self, int nID)");
export const SteamAPI_ISteamMusicRemote_QueueDidChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_QueueDidChange(ISteamMusicRemote * self)"
);
export const SteamAPI_ISteamMusicRemote_PlaylistWillChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_PlaylistWillChange(ISteamMusicRemote * self)"
);
export const SteamAPI_ISteamMusicRemote_ResetPlaylistEntries: KoffiFunc<(self: ISteamMusicRemote) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamMusicRemote_ResetPlaylistEntries(ISteamMusicRemote * self)");
export const SteamAPI_ISteamMusicRemote_SetPlaylistEntry: KoffiFunc<
   (self: ISteamMusicRemote, nID: number, nPosition: number, pchEntryText: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_SetPlaylistEntry(ISteamMusicRemote * self, int nID, int nPosition, const char * pchEntryText)"
);
export const SteamAPI_ISteamMusicRemote_SetCurrentPlaylistEntry: KoffiFunc<
   (self: ISteamMusicRemote, nID: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamMusicRemote_SetCurrentPlaylistEntry(ISteamMusicRemote * self, int nID)");
export const SteamAPI_ISteamMusicRemote_PlaylistDidChange: KoffiFunc<(self: ISteamMusicRemote) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamMusicRemote_PlaylistDidChange(ISteamMusicRemote * self)"
);
export interface ISteamHTTP {
   __brand: "ISteamHTTP";
}
koffi.opaque("ISteamHTTP");
export const SteamAPI_SteamHTTP_v003: KoffiFunc<() => ISteamHTTP> = lib.cdecl("ISteamHTTP* SteamAPI_SteamHTTP_v003()");
let ISteamHTTP_Instance: ISteamHTTP | null = null;
export function SteamAPI_ISteamHTTP(): ISteamHTTP {
   if (!ISteamHTTP_Instance) {
      ISteamHTTP_Instance = SteamAPI_SteamHTTP_v003();
   }
   return ISteamHTTP_Instance;
}
export const SteamAPI_ISteamHTTP_CreateHTTPRequest: KoffiFunc<
   (self: ISteamHTTP, eHTTPRequestMethod: EHTTPMethod, pchAbsoluteURL: string) => number
> = lib.cdecl(
   "HTTPRequestHandle SteamAPI_ISteamHTTP_CreateHTTPRequest(ISteamHTTP * self, EHTTPMethod eHTTPRequestMethod, const char * pchAbsoluteURL)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestContextValue: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, ulContextValue: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestContextValue(ISteamHTTP * self, HTTPRequestHandle hRequest, uint64 ulContextValue)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestNetworkActivityTimeout: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, unTimeoutSeconds: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestNetworkActivityTimeout(ISteamHTTP * self, HTTPRequestHandle hRequest, uint32 unTimeoutSeconds)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestHeaderValue: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pchHeaderName: string, pchHeaderValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestHeaderValue(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchHeaderName, const char * pchHeaderValue)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestGetOrPostParameter: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pchParamName: string, pchParamValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestGetOrPostParameter(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchParamName, const char * pchParamValue)"
);
export const SteamAPI_ISteamHTTP_SendHTTPRequest: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pCallHandle: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SendHTTPRequest(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ SteamAPICall_t * pCallHandle)"
);
export const SteamAPI_ISteamHTTP_SendHTTPRequestAndStreamResponse: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pCallHandle: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SendHTTPRequestAndStreamResponse(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ SteamAPICall_t * pCallHandle)"
);
export const SteamAPI_ISteamHTTP_DeferHTTPRequest: KoffiFunc<(self: ISteamHTTP, hRequest: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamHTTP_DeferHTTPRequest(ISteamHTTP * self, HTTPRequestHandle hRequest)");
export const SteamAPI_ISteamHTTP_PrioritizeHTTPRequest: KoffiFunc<(self: ISteamHTTP, hRequest: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamHTTP_PrioritizeHTTPRequest(ISteamHTTP * self, HTTPRequestHandle hRequest)");
export const SteamAPI_ISteamHTTP_GetHTTPResponseHeaderSize: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pchHeaderName: string, unResponseHeaderSize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPResponseHeaderSize(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchHeaderName, _Out_ uint32 * unResponseHeaderSize)"
);
export const SteamAPI_ISteamHTTP_GetHTTPResponseHeaderValue: KoffiFunc<
   (
      self: ISteamHTTP,
      hRequest: number,
      pchHeaderName: string,
      pHeaderValueBuffer: [number],
      unBufferSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPResponseHeaderValue(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchHeaderName, _Out_ uint8 * pHeaderValueBuffer, uint32 unBufferSize)"
);
export const SteamAPI_ISteamHTTP_GetHTTPResponseBodySize: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, unBodySize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPResponseBodySize(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ uint32 * unBodySize)"
);
export const SteamAPI_ISteamHTTP_GetHTTPResponseBodyData: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pBodyDataBuffer: [number], unBufferSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPResponseBodyData(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ uint8 * pBodyDataBuffer, uint32 unBufferSize)"
);
export const SteamAPI_ISteamHTTP_GetHTTPStreamingResponseBodyData: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, cOffset: number, pBodyDataBuffer: [number], unBufferSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPStreamingResponseBodyData(ISteamHTTP * self, HTTPRequestHandle hRequest, uint32 cOffset, _Out_ uint8 * pBodyDataBuffer, uint32 unBufferSize)"
);
export const SteamAPI_ISteamHTTP_ReleaseHTTPRequest: KoffiFunc<(self: ISteamHTTP, hRequest: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamHTTP_ReleaseHTTPRequest(ISteamHTTP * self, HTTPRequestHandle hRequest)");
export const SteamAPI_ISteamHTTP_GetHTTPDownloadProgressPct: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pflPercentOut: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPDownloadProgressPct(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ float * pflPercentOut)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestRawPostBody: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pchContentType: string, pubBody: [number], unBodyLen: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestRawPostBody(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchContentType, _Out_ uint8 * pubBody, uint32 unBodyLen)"
);
export const SteamAPI_ISteamHTTP_CreateCookieContainer: KoffiFunc<
   (self: ISteamHTTP, bAllowResponsesToModify: boolean) => number
> = lib.cdecl(
   "HTTPCookieContainerHandle SteamAPI_ISteamHTTP_CreateCookieContainer(ISteamHTTP * self, bool bAllowResponsesToModify)"
);
export const SteamAPI_ISteamHTTP_ReleaseCookieContainer: KoffiFunc<
   (self: ISteamHTTP, hCookieContainer: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_ReleaseCookieContainer(ISteamHTTP * self, HTTPCookieContainerHandle hCookieContainer)"
);
export const SteamAPI_ISteamHTTP_SetCookie: KoffiFunc<
   (self: ISteamHTTP, hCookieContainer: number, pchHost: string, pchUrl: string, pchCookie: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetCookie(ISteamHTTP * self, HTTPCookieContainerHandle hCookieContainer, const char * pchHost, const char * pchUrl, const char * pchCookie)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestCookieContainer: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, hCookieContainer: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestCookieContainer(ISteamHTTP * self, HTTPRequestHandle hRequest, HTTPCookieContainerHandle hCookieContainer)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestUserAgentInfo: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pchUserAgentInfo: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestUserAgentInfo(ISteamHTTP * self, HTTPRequestHandle hRequest, const char * pchUserAgentInfo)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestRequiresVerifiedCertificate: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, bRequireVerifiedCertificate: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestRequiresVerifiedCertificate(ISteamHTTP * self, HTTPRequestHandle hRequest, bool bRequireVerifiedCertificate)"
);
export const SteamAPI_ISteamHTTP_SetHTTPRequestAbsoluteTimeoutMS: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, unMilliseconds: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_SetHTTPRequestAbsoluteTimeoutMS(ISteamHTTP * self, HTTPRequestHandle hRequest, uint32 unMilliseconds)"
);
export const SteamAPI_ISteamHTTP_GetHTTPRequestWasTimedOut: KoffiFunc<
   (self: ISteamHTTP, hRequest: number, pbWasTimedOut: [boolean]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamHTTP_GetHTTPRequestWasTimedOut(ISteamHTTP * self, HTTPRequestHandle hRequest, _Out_ bool * pbWasTimedOut)"
);
export interface ISteamInput {
   __brand: "ISteamInput";
}
koffi.opaque("ISteamInput");
export const SteamAPI_SteamInput_v006: KoffiFunc<() => ISteamInput> = lib.cdecl(
   "ISteamInput* SteamAPI_SteamInput_v006()"
);
let ISteamInput_Instance: ISteamInput | null = null;
export function SteamAPI_ISteamInput(): ISteamInput {
   if (!ISteamInput_Instance) {
      ISteamInput_Instance = SteamAPI_SteamInput_v006();
   }
   return ISteamInput_Instance;
}
export const SteamAPI_ISteamInput_Init: KoffiFunc<(self: ISteamInput, bExplicitlyCallRunFrame: boolean) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamInput_Init(ISteamInput * self, bool bExplicitlyCallRunFrame)");
export const SteamAPI_ISteamInput_Shutdown: KoffiFunc<(self: ISteamInput) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamInput_Shutdown(ISteamInput * self)"
);
export const SteamAPI_ISteamInput_SetInputActionManifestFilePath: KoffiFunc<
   (self: ISteamInput, pchInputActionManifestAbsolutePath: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInput_SetInputActionManifestFilePath(ISteamInput * self, const char * pchInputActionManifestAbsolutePath)"
);
export const SteamAPI_ISteamInput_RunFrame: KoffiFunc<(self: ISteamInput, bReservedValue: boolean) => void> = lib.cdecl(
   "void SteamAPI_ISteamInput_RunFrame(ISteamInput * self, bool bReservedValue)"
);
export const SteamAPI_ISteamInput_BWaitForData: KoffiFunc<
   (self: ISteamInput, bWaitForever: boolean, unTimeout: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamInput_BWaitForData(ISteamInput * self, bool bWaitForever, uint32 unTimeout)");
export const SteamAPI_ISteamInput_BNewDataAvailable: KoffiFunc<(self: ISteamInput) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamInput_BNewDataAvailable(ISteamInput * self)"
);
export const SteamAPI_ISteamInput_GetConnectedControllers: KoffiFunc<
   (self: ISteamInput, handlesOut: [number]) => number
> = lib.cdecl("int SteamAPI_ISteamInput_GetConnectedControllers(ISteamInput * self, _Out_ InputHandle_t * handlesOut)");
export const SteamAPI_ISteamInput_EnableDeviceCallbacks: KoffiFunc<(self: ISteamInput) => void> = lib.cdecl(
   "void SteamAPI_ISteamInput_EnableDeviceCallbacks(ISteamInput * self)"
);
export const SteamAPI_ISteamInput_GetActionSetHandle: KoffiFunc<
   (self: ISteamInput, pszActionSetName: string) => number
> = lib.cdecl(
   "InputActionSetHandle_t SteamAPI_ISteamInput_GetActionSetHandle(ISteamInput * self, const char * pszActionSetName)"
);
export const SteamAPI_ISteamInput_ActivateActionSet: KoffiFunc<
   (self: ISteamInput, inputHandle: number, actionSetHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_ActivateActionSet(ISteamInput * self, InputHandle_t inputHandle, InputActionSetHandle_t actionSetHandle)"
);
export const SteamAPI_ISteamInput_GetCurrentActionSet: KoffiFunc<(self: ISteamInput, inputHandle: number) => number> =
   lib.cdecl(
      "InputActionSetHandle_t SteamAPI_ISteamInput_GetCurrentActionSet(ISteamInput * self, InputHandle_t inputHandle)"
   );
export const SteamAPI_ISteamInput_ActivateActionSetLayer: KoffiFunc<
   (self: ISteamInput, inputHandle: number, actionSetLayerHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_ActivateActionSetLayer(ISteamInput * self, InputHandle_t inputHandle, InputActionSetHandle_t actionSetLayerHandle)"
);
export const SteamAPI_ISteamInput_DeactivateActionSetLayer: KoffiFunc<
   (self: ISteamInput, inputHandle: number, actionSetLayerHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_DeactivateActionSetLayer(ISteamInput * self, InputHandle_t inputHandle, InputActionSetHandle_t actionSetLayerHandle)"
);
export const SteamAPI_ISteamInput_DeactivateAllActionSetLayers: KoffiFunc<
   (self: ISteamInput, inputHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamInput_DeactivateAllActionSetLayers(ISteamInput * self, InputHandle_t inputHandle)");
export const SteamAPI_ISteamInput_GetActiveActionSetLayers: KoffiFunc<
   (self: ISteamInput, inputHandle: number, handlesOut: [number]) => number
> = lib.cdecl(
   "int SteamAPI_ISteamInput_GetActiveActionSetLayers(ISteamInput * self, InputHandle_t inputHandle, _Out_ InputActionSetHandle_t * handlesOut)"
);
export const SteamAPI_ISteamInput_GetDigitalActionHandle: KoffiFunc<
   (self: ISteamInput, pszActionName: string) => number
> = lib.cdecl(
   "InputDigitalActionHandle_t SteamAPI_ISteamInput_GetDigitalActionHandle(ISteamInput * self, const char * pszActionName)"
);
export const SteamAPI_ISteamInput_GetDigitalActionOrigins: KoffiFunc<
   (
      self: ISteamInput,
      inputHandle: number,
      actionSetHandle: number,
      digitalActionHandle: number,
      originsOut: [EInputActionOrigin]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamInput_GetDigitalActionOrigins(ISteamInput * self, InputHandle_t inputHandle, InputActionSetHandle_t actionSetHandle, InputDigitalActionHandle_t digitalActionHandle, _Out_ EInputActionOrigin * originsOut)"
);
export const SteamAPI_ISteamInput_GetStringForDigitalActionName: KoffiFunc<
   (self: ISteamInput, eActionHandle: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetStringForDigitalActionName(ISteamInput * self, InputDigitalActionHandle_t eActionHandle)"
);
export const SteamAPI_ISteamInput_GetAnalogActionHandle: KoffiFunc<
   (self: ISteamInput, pszActionName: string) => number
> = lib.cdecl(
   "InputAnalogActionHandle_t SteamAPI_ISteamInput_GetAnalogActionHandle(ISteamInput * self, const char * pszActionName)"
);
export const SteamAPI_ISteamInput_GetAnalogActionOrigins: KoffiFunc<
   (
      self: ISteamInput,
      inputHandle: number,
      actionSetHandle: number,
      analogActionHandle: number,
      originsOut: [EInputActionOrigin]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamInput_GetAnalogActionOrigins(ISteamInput * self, InputHandle_t inputHandle, InputActionSetHandle_t actionSetHandle, InputAnalogActionHandle_t analogActionHandle, _Out_ EInputActionOrigin * originsOut)"
);
export const SteamAPI_ISteamInput_GetGlyphPNGForActionOrigin: KoffiFunc<
   (self: ISteamInput, eOrigin: EInputActionOrigin, eSize: ESteamInputGlyphSize, unFlags: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetGlyphPNGForActionOrigin(ISteamInput * self, EInputActionOrigin eOrigin, ESteamInputGlyphSize eSize, uint32 unFlags)"
);
export const SteamAPI_ISteamInput_GetGlyphSVGForActionOrigin: KoffiFunc<
   (self: ISteamInput, eOrigin: EInputActionOrigin, unFlags: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetGlyphSVGForActionOrigin(ISteamInput * self, EInputActionOrigin eOrigin, uint32 unFlags)"
);
export const SteamAPI_ISteamInput_GetGlyphForActionOrigin_Legacy: KoffiFunc<
   (self: ISteamInput, eOrigin: EInputActionOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetGlyphForActionOrigin_Legacy(ISteamInput * self, EInputActionOrigin eOrigin)"
);
export const SteamAPI_ISteamInput_GetStringForActionOrigin: KoffiFunc<
   (self: ISteamInput, eOrigin: EInputActionOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetStringForActionOrigin(ISteamInput * self, EInputActionOrigin eOrigin)"
);
export const SteamAPI_ISteamInput_GetStringForAnalogActionName: KoffiFunc<
   (self: ISteamInput, eActionHandle: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamInput_GetStringForAnalogActionName(ISteamInput * self, InputAnalogActionHandle_t eActionHandle)"
);
export const SteamAPI_ISteamInput_StopAnalogActionMomentum: KoffiFunc<
   (self: ISteamInput, inputHandle: number, eAction: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_StopAnalogActionMomentum(ISteamInput * self, InputHandle_t inputHandle, InputAnalogActionHandle_t eAction)"
);
export const SteamAPI_ISteamInput_TriggerVibration: KoffiFunc<
   (self: ISteamInput, inputHandle: number, usLeftSpeed: number, usRightSpeed: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_TriggerVibration(ISteamInput * self, InputHandle_t inputHandle, unsigned short usLeftSpeed, unsigned short usRightSpeed)"
);
export const SteamAPI_ISteamInput_TriggerVibrationExtended: KoffiFunc<
   (
      self: ISteamInput,
      inputHandle: number,
      usLeftSpeed: number,
      usRightSpeed: number,
      usLeftTriggerSpeed: number,
      usRightTriggerSpeed: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_TriggerVibrationExtended(ISteamInput * self, InputHandle_t inputHandle, unsigned short usLeftSpeed, unsigned short usRightSpeed, unsigned short usLeftTriggerSpeed, unsigned short usRightTriggerSpeed)"
);
export const SteamAPI_ISteamInput_TriggerSimpleHapticEvent: KoffiFunc<
   (
      self: ISteamInput,
      inputHandle: number,
      eHapticLocation: EControllerHapticLocation,
      nIntensity: number,
      nGainDB: number,
      nOtherIntensity: number,
      nOtherGainDB: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_TriggerSimpleHapticEvent(ISteamInput * self, InputHandle_t inputHandle, EControllerHapticLocation eHapticLocation, uint8 nIntensity, char nGainDB, uint8 nOtherIntensity, char nOtherGainDB)"
);
export const SteamAPI_ISteamInput_SetLEDColor: KoffiFunc<
   (self: ISteamInput, inputHandle: number, nColorR: number, nColorG: number, nColorB: number, nFlags: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_SetLEDColor(ISteamInput * self, InputHandle_t inputHandle, uint8 nColorR, uint8 nColorG, uint8 nColorB, unsigned int nFlags)"
);
export const SteamAPI_ISteamInput_Legacy_TriggerHapticPulse: KoffiFunc<
   (self: ISteamInput, inputHandle: number, eTargetPad: ESteamControllerPad, usDurationMicroSec: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_Legacy_TriggerHapticPulse(ISteamInput * self, InputHandle_t inputHandle, ESteamControllerPad eTargetPad, unsigned short usDurationMicroSec)"
);
export const SteamAPI_ISteamInput_Legacy_TriggerRepeatedHapticPulse: KoffiFunc<
   (
      self: ISteamInput,
      inputHandle: number,
      eTargetPad: ESteamControllerPad,
      usDurationMicroSec: number,
      usOffMicroSec: number,
      unRepeat: number,
      nFlags: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamInput_Legacy_TriggerRepeatedHapticPulse(ISteamInput * self, InputHandle_t inputHandle, ESteamControllerPad eTargetPad, unsigned short usDurationMicroSec, unsigned short usOffMicroSec, unsigned short unRepeat, unsigned int nFlags)"
);
export const SteamAPI_ISteamInput_ShowBindingPanel: KoffiFunc<(self: ISteamInput, inputHandle: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamInput_ShowBindingPanel(ISteamInput * self, InputHandle_t inputHandle)");
export const SteamAPI_ISteamInput_GetInputTypeForHandle: KoffiFunc<
   (self: ISteamInput, inputHandle: number) => ESteamInputType
> = lib.cdecl(
   "ESteamInputType SteamAPI_ISteamInput_GetInputTypeForHandle(ISteamInput * self, InputHandle_t inputHandle)"
);
export const SteamAPI_ISteamInput_GetControllerForGamepadIndex: KoffiFunc<
   (self: ISteamInput, nIndex: number) => number
> = lib.cdecl("InputHandle_t SteamAPI_ISteamInput_GetControllerForGamepadIndex(ISteamInput * self, int nIndex)");
export const SteamAPI_ISteamInput_GetGamepadIndexForController: KoffiFunc<
   (self: ISteamInput, ulinputHandle: number) => number
> = lib.cdecl("int SteamAPI_ISteamInput_GetGamepadIndexForController(ISteamInput * self, InputHandle_t ulinputHandle)");
export const SteamAPI_ISteamInput_GetStringForXboxOrigin: KoffiFunc<
   (self: ISteamInput, eOrigin: EXboxOrigin) => string
> = lib.cdecl("const char * SteamAPI_ISteamInput_GetStringForXboxOrigin(ISteamInput * self, EXboxOrigin eOrigin)");
export const SteamAPI_ISteamInput_GetGlyphForXboxOrigin: KoffiFunc<
   (self: ISteamInput, eOrigin: EXboxOrigin) => string
> = lib.cdecl("const char * SteamAPI_ISteamInput_GetGlyphForXboxOrigin(ISteamInput * self, EXboxOrigin eOrigin)");
export const SteamAPI_ISteamInput_GetActionOriginFromXboxOrigin: KoffiFunc<
   (self: ISteamInput, inputHandle: number, eOrigin: EXboxOrigin) => EInputActionOrigin
> = lib.cdecl(
   "EInputActionOrigin SteamAPI_ISteamInput_GetActionOriginFromXboxOrigin(ISteamInput * self, InputHandle_t inputHandle, EXboxOrigin eOrigin)"
);
export const SteamAPI_ISteamInput_TranslateActionOrigin: KoffiFunc<
   (self: ISteamInput, eDestinationInputType: ESteamInputType, eSourceOrigin: EInputActionOrigin) => EInputActionOrigin
> = lib.cdecl(
   "EInputActionOrigin SteamAPI_ISteamInput_TranslateActionOrigin(ISteamInput * self, ESteamInputType eDestinationInputType, EInputActionOrigin eSourceOrigin)"
);
export const SteamAPI_ISteamInput_GetDeviceBindingRevision: KoffiFunc<
   (self: ISteamInput, inputHandle: number, pMajor: [number], pMinor: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInput_GetDeviceBindingRevision(ISteamInput * self, InputHandle_t inputHandle, _Out_ int * pMajor, _Out_ int * pMinor)"
);
export const SteamAPI_ISteamInput_GetRemotePlaySessionID: KoffiFunc<
   (self: ISteamInput, inputHandle: number) => number
> = lib.cdecl("uint32 SteamAPI_ISteamInput_GetRemotePlaySessionID(ISteamInput * self, InputHandle_t inputHandle)");
export const SteamAPI_ISteamInput_GetSessionInputConfigurationSettings: KoffiFunc<(self: ISteamInput) => number> =
   lib.cdecl("uint16 SteamAPI_ISteamInput_GetSessionInputConfigurationSettings(ISteamInput * self)");
export interface ISteamController {
   __brand: "ISteamController";
}
koffi.opaque("ISteamController");
export const SteamAPI_SteamController_v008: KoffiFunc<() => ISteamController> = lib.cdecl(
   "ISteamController* SteamAPI_SteamController_v008()"
);
let ISteamController_Instance: ISteamController | null = null;
export function SteamAPI_ISteamController(): ISteamController {
   if (!ISteamController_Instance) {
      ISteamController_Instance = SteamAPI_SteamController_v008();
   }
   return ISteamController_Instance;
}
export const SteamAPI_ISteamController_Init: KoffiFunc<(self: ISteamController) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamController_Init(ISteamController * self)"
);
export const SteamAPI_ISteamController_Shutdown: KoffiFunc<(self: ISteamController) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamController_Shutdown(ISteamController * self)"
);
export const SteamAPI_ISteamController_RunFrame: KoffiFunc<(self: ISteamController) => void> = lib.cdecl(
   "void SteamAPI_ISteamController_RunFrame(ISteamController * self)"
);
export const SteamAPI_ISteamController_GetConnectedControllers: KoffiFunc<
   (self: ISteamController, handlesOut: [number]) => number
> = lib.cdecl(
   "int SteamAPI_ISteamController_GetConnectedControllers(ISteamController * self, _Out_ ControllerHandle_t * handlesOut)"
);
export const SteamAPI_ISteamController_GetActionSetHandle: KoffiFunc<
   (self: ISteamController, pszActionSetName: string) => number
> = lib.cdecl(
   "ControllerActionSetHandle_t SteamAPI_ISteamController_GetActionSetHandle(ISteamController * self, const char * pszActionSetName)"
);
export const SteamAPI_ISteamController_ActivateActionSet: KoffiFunc<
   (self: ISteamController, controllerHandle: number, actionSetHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_ActivateActionSet(ISteamController * self, ControllerHandle_t controllerHandle, ControllerActionSetHandle_t actionSetHandle)"
);
export const SteamAPI_ISteamController_GetCurrentActionSet: KoffiFunc<
   (self: ISteamController, controllerHandle: number) => number
> = lib.cdecl(
   "ControllerActionSetHandle_t SteamAPI_ISteamController_GetCurrentActionSet(ISteamController * self, ControllerHandle_t controllerHandle)"
);
export const SteamAPI_ISteamController_ActivateActionSetLayer: KoffiFunc<
   (self: ISteamController, controllerHandle: number, actionSetLayerHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_ActivateActionSetLayer(ISteamController * self, ControllerHandle_t controllerHandle, ControllerActionSetHandle_t actionSetLayerHandle)"
);
export const SteamAPI_ISteamController_DeactivateActionSetLayer: KoffiFunc<
   (self: ISteamController, controllerHandle: number, actionSetLayerHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_DeactivateActionSetLayer(ISteamController * self, ControllerHandle_t controllerHandle, ControllerActionSetHandle_t actionSetLayerHandle)"
);
export const SteamAPI_ISteamController_DeactivateAllActionSetLayers: KoffiFunc<
   (self: ISteamController, controllerHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_DeactivateAllActionSetLayers(ISteamController * self, ControllerHandle_t controllerHandle)"
);
export const SteamAPI_ISteamController_GetActiveActionSetLayers: KoffiFunc<
   (self: ISteamController, controllerHandle: number, handlesOut: [number]) => number
> = lib.cdecl(
   "int SteamAPI_ISteamController_GetActiveActionSetLayers(ISteamController * self, ControllerHandle_t controllerHandle, _Out_ ControllerActionSetHandle_t * handlesOut)"
);
export const SteamAPI_ISteamController_GetDigitalActionHandle: KoffiFunc<
   (self: ISteamController, pszActionName: string) => number
> = lib.cdecl(
   "ControllerDigitalActionHandle_t SteamAPI_ISteamController_GetDigitalActionHandle(ISteamController * self, const char * pszActionName)"
);
export const SteamAPI_ISteamController_GetDigitalActionOrigins: KoffiFunc<
   (
      self: ISteamController,
      controllerHandle: number,
      actionSetHandle: number,
      digitalActionHandle: number,
      originsOut: [EControllerActionOrigin]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamController_GetDigitalActionOrigins(ISteamController * self, ControllerHandle_t controllerHandle, ControllerActionSetHandle_t actionSetHandle, ControllerDigitalActionHandle_t digitalActionHandle, _Out_ EControllerActionOrigin * originsOut)"
);
export const SteamAPI_ISteamController_GetAnalogActionHandle: KoffiFunc<
   (self: ISteamController, pszActionName: string) => number
> = lib.cdecl(
   "ControllerAnalogActionHandle_t SteamAPI_ISteamController_GetAnalogActionHandle(ISteamController * self, const char * pszActionName)"
);
export const SteamAPI_ISteamController_GetAnalogActionOrigins: KoffiFunc<
   (
      self: ISteamController,
      controllerHandle: number,
      actionSetHandle: number,
      analogActionHandle: number,
      originsOut: [EControllerActionOrigin]
   ) => number
> = lib.cdecl(
   "int SteamAPI_ISteamController_GetAnalogActionOrigins(ISteamController * self, ControllerHandle_t controllerHandle, ControllerActionSetHandle_t actionSetHandle, ControllerAnalogActionHandle_t analogActionHandle, _Out_ EControllerActionOrigin * originsOut)"
);
export const SteamAPI_ISteamController_GetGlyphForActionOrigin: KoffiFunc<
   (self: ISteamController, eOrigin: EControllerActionOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamController_GetGlyphForActionOrigin(ISteamController * self, EControllerActionOrigin eOrigin)"
);
export const SteamAPI_ISteamController_GetStringForActionOrigin: KoffiFunc<
   (self: ISteamController, eOrigin: EControllerActionOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamController_GetStringForActionOrigin(ISteamController * self, EControllerActionOrigin eOrigin)"
);
export const SteamAPI_ISteamController_StopAnalogActionMomentum: KoffiFunc<
   (self: ISteamController, controllerHandle: number, eAction: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_StopAnalogActionMomentum(ISteamController * self, ControllerHandle_t controllerHandle, ControllerAnalogActionHandle_t eAction)"
);
export const SteamAPI_ISteamController_TriggerHapticPulse: KoffiFunc<
   (
      self: ISteamController,
      controllerHandle: number,
      eTargetPad: ESteamControllerPad,
      usDurationMicroSec: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_TriggerHapticPulse(ISteamController * self, ControllerHandle_t controllerHandle, ESteamControllerPad eTargetPad, unsigned short usDurationMicroSec)"
);
export const SteamAPI_ISteamController_TriggerRepeatedHapticPulse: KoffiFunc<
   (
      self: ISteamController,
      controllerHandle: number,
      eTargetPad: ESteamControllerPad,
      usDurationMicroSec: number,
      usOffMicroSec: number,
      unRepeat: number,
      nFlags: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_TriggerRepeatedHapticPulse(ISteamController * self, ControllerHandle_t controllerHandle, ESteamControllerPad eTargetPad, unsigned short usDurationMicroSec, unsigned short usOffMicroSec, unsigned short unRepeat, unsigned int nFlags)"
);
export const SteamAPI_ISteamController_TriggerVibration: KoffiFunc<
   (self: ISteamController, controllerHandle: number, usLeftSpeed: number, usRightSpeed: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_TriggerVibration(ISteamController * self, ControllerHandle_t controllerHandle, unsigned short usLeftSpeed, unsigned short usRightSpeed)"
);
export const SteamAPI_ISteamController_SetLEDColor: KoffiFunc<
   (
      self: ISteamController,
      controllerHandle: number,
      nColorR: number,
      nColorG: number,
      nColorB: number,
      nFlags: number
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamController_SetLEDColor(ISteamController * self, ControllerHandle_t controllerHandle, uint8 nColorR, uint8 nColorG, uint8 nColorB, unsigned int nFlags)"
);
export const SteamAPI_ISteamController_ShowBindingPanel: KoffiFunc<
   (self: ISteamController, controllerHandle: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamController_ShowBindingPanel(ISteamController * self, ControllerHandle_t controllerHandle)"
);
export const SteamAPI_ISteamController_GetInputTypeForHandle: KoffiFunc<
   (self: ISteamController, controllerHandle: number) => ESteamInputType
> = lib.cdecl(
   "ESteamInputType SteamAPI_ISteamController_GetInputTypeForHandle(ISteamController * self, ControllerHandle_t controllerHandle)"
);
export const SteamAPI_ISteamController_GetControllerForGamepadIndex: KoffiFunc<
   (self: ISteamController, nIndex: number) => number
> = lib.cdecl(
   "ControllerHandle_t SteamAPI_ISteamController_GetControllerForGamepadIndex(ISteamController * self, int nIndex)"
);
export const SteamAPI_ISteamController_GetGamepadIndexForController: KoffiFunc<
   (self: ISteamController, ulControllerHandle: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamController_GetGamepadIndexForController(ISteamController * self, ControllerHandle_t ulControllerHandle)"
);
export const SteamAPI_ISteamController_GetStringForXboxOrigin: KoffiFunc<
   (self: ISteamController, eOrigin: EXboxOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamController_GetStringForXboxOrigin(ISteamController * self, EXboxOrigin eOrigin)"
);
export const SteamAPI_ISteamController_GetGlyphForXboxOrigin: KoffiFunc<
   (self: ISteamController, eOrigin: EXboxOrigin) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamController_GetGlyphForXboxOrigin(ISteamController * self, EXboxOrigin eOrigin)"
);
export const SteamAPI_ISteamController_GetActionOriginFromXboxOrigin: KoffiFunc<
   (self: ISteamController, controllerHandle: number, eOrigin: EXboxOrigin) => EControllerActionOrigin
> = lib.cdecl(
   "EControllerActionOrigin SteamAPI_ISteamController_GetActionOriginFromXboxOrigin(ISteamController * self, ControllerHandle_t controllerHandle, EXboxOrigin eOrigin)"
);
export const SteamAPI_ISteamController_TranslateActionOrigin: KoffiFunc<
   (
      self: ISteamController,
      eDestinationInputType: ESteamInputType,
      eSourceOrigin: EControllerActionOrigin
   ) => EControllerActionOrigin
> = lib.cdecl(
   "EControllerActionOrigin SteamAPI_ISteamController_TranslateActionOrigin(ISteamController * self, ESteamInputType eDestinationInputType, EControllerActionOrigin eSourceOrigin)"
);
export const SteamAPI_ISteamController_GetControllerBindingRevision: KoffiFunc<
   (self: ISteamController, controllerHandle: number, pMajor: [number], pMinor: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamController_GetControllerBindingRevision(ISteamController * self, ControllerHandle_t controllerHandle, _Out_ int * pMajor, _Out_ int * pMinor)"
);
export interface ISteamUGC {
   __brand: "ISteamUGC";
}
koffi.opaque("ISteamUGC");
export const SteamAPI_SteamUGC_v016: KoffiFunc<() => ISteamUGC> = lib.cdecl("ISteamUGC* SteamAPI_SteamUGC_v016()");
let ISteamUGC_Instance: ISteamUGC | null = null;
export function SteamAPI_ISteamUGC(): ISteamUGC {
   if (!ISteamUGC_Instance) {
      ISteamUGC_Instance = SteamAPI_SteamUGC_v016();
   }
   return ISteamUGC_Instance;
}
export const SteamAPI_ISteamUGC_CreateQueryUserUGCRequest: KoffiFunc<
   (
      self: ISteamUGC,
      unAccountID: number,
      eListType: EUserUGCList,
      eMatchingUGCType: EUGCMatchingUGCType,
      eSortOrder: EUserUGCListSortOrder,
      nCreatorAppID: number,
      nConsumerAppID: number,
      unPage: number
   ) => number
> = lib.cdecl(
   "UGCQueryHandle_t SteamAPI_ISteamUGC_CreateQueryUserUGCRequest(ISteamUGC * self, AccountID_t unAccountID, EUserUGCList eListType, EUGCMatchingUGCType eMatchingUGCType, EUserUGCListSortOrder eSortOrder, AppId_t nCreatorAppID, AppId_t nConsumerAppID, uint32 unPage)"
);
export const SteamAPI_ISteamUGC_CreateQueryAllUGCRequestPage: KoffiFunc<
   (
      self: ISteamUGC,
      eQueryType: EUGCQuery,
      eMatchingeMatchingUGCTypeFileType: EUGCMatchingUGCType,
      nCreatorAppID: number,
      nConsumerAppID: number,
      unPage: number
   ) => number
> = lib.cdecl(
   "UGCQueryHandle_t SteamAPI_ISteamUGC_CreateQueryAllUGCRequestPage(ISteamUGC * self, EUGCQuery eQueryType, EUGCMatchingUGCType eMatchingeMatchingUGCTypeFileType, AppId_t nCreatorAppID, AppId_t nConsumerAppID, uint32 unPage)"
);
export const SteamAPI_ISteamUGC_CreateQueryAllUGCRequestCursor: KoffiFunc<
   (
      self: ISteamUGC,
      eQueryType: EUGCQuery,
      eMatchingeMatchingUGCTypeFileType: EUGCMatchingUGCType,
      nCreatorAppID: number,
      nConsumerAppID: number,
      pchCursor: string
   ) => number
> = lib.cdecl(
   "UGCQueryHandle_t SteamAPI_ISteamUGC_CreateQueryAllUGCRequestCursor(ISteamUGC * self, EUGCQuery eQueryType, EUGCMatchingUGCType eMatchingeMatchingUGCTypeFileType, AppId_t nCreatorAppID, AppId_t nConsumerAppID, const char * pchCursor)"
);
export const SteamAPI_ISteamUGC_CreateQueryUGCDetailsRequest: KoffiFunc<
   (self: ISteamUGC, pvecPublishedFileID: [number], unNumPublishedFileIDs: number) => number
> = lib.cdecl(
   "UGCQueryHandle_t SteamAPI_ISteamUGC_CreateQueryUGCDetailsRequest(ISteamUGC * self, _Out_ PublishedFileId_t * pvecPublishedFileID, uint32 unNumPublishedFileIDs)"
);
export const SteamAPI_ISteamUGC_SendQueryUGCRequest: KoffiFunc<(self: ISteamUGC, handle: number) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_SendQueryUGCRequest(ISteamUGC * self, UGCQueryHandle_t handle)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCNumTags: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number) => number
> = lib.cdecl("uint32 SteamAPI_ISteamUGC_GetQueryUGCNumTags(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index)");
export const SteamAPI_ISteamUGC_GetQueryUGCTag: KoffiFunc<
   (
      self: ISteamUGC,
      handle: number,
      index: number,
      indexTag: number,
      pchValue: [string],
      cchValueSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCTag(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, uint32 indexTag, _Out_ char * pchValue, uint32 cchValueSize)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCTagDisplayName: KoffiFunc<
   (
      self: ISteamUGC,
      handle: number,
      index: number,
      indexTag: number,
      pchValue: [string],
      cchValueSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCTagDisplayName(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, uint32 indexTag, _Out_ char * pchValue, uint32 cchValueSize)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCPreviewURL: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pchURL: [string], cchURLSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCPreviewURL(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, _Out_ char * pchURL, uint32 cchURLSize)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCMetadata: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pchMetadata: [string], cchMetadatasize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCMetadata(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, _Out_ char * pchMetadata, uint32 cchMetadatasize)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCChildren: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pvecPublishedFileID: [number], cMaxEntries: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCChildren(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, _Out_ PublishedFileId_t * pvecPublishedFileID, uint32 cMaxEntries)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCStatistic: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, eStatType: EItemStatistic, pStatValue: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCStatistic(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, EItemStatistic eStatType, _Out_ uint64 * pStatValue)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCNumAdditionalPreviews: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamUGC_GetQueryUGCNumAdditionalPreviews(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCAdditionalPreview: KoffiFunc<
   (
      self: ISteamUGC,
      handle: number,
      index: number,
      previewIndex: number,
      pchURLOrVideoID: [string],
      cchURLSize: number,
      pchOriginalFileName: [string],
      cchOriginalFileNameSize: number,
      pPreviewType: [EItemPreviewType]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCAdditionalPreview(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, uint32 previewIndex, _Out_ char * pchURLOrVideoID, uint32 cchURLSize, _Out_ char * pchOriginalFileName, uint32 cchOriginalFileNameSize, _Out_ EItemPreviewType * pPreviewType)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCNumKeyValueTags: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamUGC_GetQueryUGCNumKeyValueTags(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index)"
);
export const SteamAPI_ISteamUGC_GetQueryUGCKeyValueTag: KoffiFunc<
   (
      self: ISteamUGC,
      handle: number,
      index: number,
      keyValueTagIndex: number,
      pchKey: [string],
      cchKeySize: number,
      pchValue: [string],
      cchValueSize: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryUGCKeyValueTag(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, uint32 keyValueTagIndex, _Out_ char * pchKey, uint32 cchKeySize, _Out_ char * pchValue, uint32 cchValueSize)"
);
export const SteamAPI_ISteamUGC_GetQueryFirstUGCKeyValueTag: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pchKey: string, pchValue: [string], cchValueSize: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetQueryFirstUGCKeyValueTag(ISteamUGC * self, UGCQueryHandle_t handle, uint32 index, const char * pchKey, _Out_ char * pchValue, uint32 cchValueSize)"
);
export const SteamAPI_ISteamUGC_ReleaseQueryUGCRequest: KoffiFunc<(self: ISteamUGC, handle: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUGC_ReleaseQueryUGCRequest(ISteamUGC * self, UGCQueryHandle_t handle)");
export const SteamAPI_ISteamUGC_AddRequiredTag: KoffiFunc<
   (self: ISteamUGC, handle: number, pTagName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddRequiredTag(ISteamUGC * self, UGCQueryHandle_t handle, const char * pTagName)"
);
export const SteamAPI_ISteamUGC_AddExcludedTag: KoffiFunc<
   (self: ISteamUGC, handle: number, pTagName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddExcludedTag(ISteamUGC * self, UGCQueryHandle_t handle, const char * pTagName)"
);
export const SteamAPI_ISteamUGC_SetReturnOnlyIDs: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnOnlyIDs: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnOnlyIDs(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnOnlyIDs)"
);
export const SteamAPI_ISteamUGC_SetReturnKeyValueTags: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnKeyValueTags: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnKeyValueTags(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnKeyValueTags)"
);
export const SteamAPI_ISteamUGC_SetReturnLongDescription: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnLongDescription: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnLongDescription(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnLongDescription)"
);
export const SteamAPI_ISteamUGC_SetReturnMetadata: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnMetadata: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnMetadata(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnMetadata)"
);
export const SteamAPI_ISteamUGC_SetReturnChildren: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnChildren: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnChildren(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnChildren)"
);
export const SteamAPI_ISteamUGC_SetReturnAdditionalPreviews: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnAdditionalPreviews: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnAdditionalPreviews(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnAdditionalPreviews)"
);
export const SteamAPI_ISteamUGC_SetReturnTotalOnly: KoffiFunc<
   (self: ISteamUGC, handle: number, bReturnTotalOnly: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnTotalOnly(ISteamUGC * self, UGCQueryHandle_t handle, bool bReturnTotalOnly)"
);
export const SteamAPI_ISteamUGC_SetReturnPlaytimeStats: KoffiFunc<
   (self: ISteamUGC, handle: number, unDays: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetReturnPlaytimeStats(ISteamUGC * self, UGCQueryHandle_t handle, uint32 unDays)"
);
export const SteamAPI_ISteamUGC_SetLanguage: KoffiFunc<
   (self: ISteamUGC, handle: number, pchLanguage: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetLanguage(ISteamUGC * self, UGCQueryHandle_t handle, const char * pchLanguage)"
);
export const SteamAPI_ISteamUGC_SetAllowCachedResponse: KoffiFunc<
   (self: ISteamUGC, handle: number, unMaxAgeSeconds: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetAllowCachedResponse(ISteamUGC * self, UGCQueryHandle_t handle, uint32 unMaxAgeSeconds)"
);
export const SteamAPI_ISteamUGC_SetCloudFileNameFilter: KoffiFunc<
   (self: ISteamUGC, handle: number, pMatchCloudFileName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetCloudFileNameFilter(ISteamUGC * self, UGCQueryHandle_t handle, const char * pMatchCloudFileName)"
);
export const SteamAPI_ISteamUGC_SetMatchAnyTag: KoffiFunc<
   (self: ISteamUGC, handle: number, bMatchAnyTag: boolean) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUGC_SetMatchAnyTag(ISteamUGC * self, UGCQueryHandle_t handle, bool bMatchAnyTag)");
export const SteamAPI_ISteamUGC_SetSearchText: KoffiFunc<
   (self: ISteamUGC, handle: number, pSearchText: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetSearchText(ISteamUGC * self, UGCQueryHandle_t handle, const char * pSearchText)"
);
export const SteamAPI_ISteamUGC_SetRankedByTrendDays: KoffiFunc<
   (self: ISteamUGC, handle: number, unDays: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUGC_SetRankedByTrendDays(ISteamUGC * self, UGCQueryHandle_t handle, uint32 unDays)");
export const SteamAPI_ISteamUGC_SetTimeCreatedDateRange: KoffiFunc<
   (self: ISteamUGC, handle: number, rtStart: number, rtEnd: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetTimeCreatedDateRange(ISteamUGC * self, UGCQueryHandle_t handle, RTime32 rtStart, RTime32 rtEnd)"
);
export const SteamAPI_ISteamUGC_SetTimeUpdatedDateRange: KoffiFunc<
   (self: ISteamUGC, handle: number, rtStart: number, rtEnd: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetTimeUpdatedDateRange(ISteamUGC * self, UGCQueryHandle_t handle, RTime32 rtStart, RTime32 rtEnd)"
);
export const SteamAPI_ISteamUGC_AddRequiredKeyValueTag: KoffiFunc<
   (self: ISteamUGC, handle: number, pKey: string, pValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddRequiredKeyValueTag(ISteamUGC * self, UGCQueryHandle_t handle, const char * pKey, const char * pValue)"
);
export const SteamAPI_ISteamUGC_RequestUGCDetails: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, unMaxAgeSeconds: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_RequestUGCDetails(ISteamUGC * self, PublishedFileId_t nPublishedFileID, uint32 unMaxAgeSeconds)"
);
export const SteamAPI_ISteamUGC_CreateItem: KoffiFunc<
   (self: ISteamUGC, nConsumerAppId: number, eFileType: EWorkshopFileType) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_CreateItem(ISteamUGC * self, AppId_t nConsumerAppId, EWorkshopFileType eFileType)"
);
export const SteamAPI_ISteamUGC_StartItemUpdate: KoffiFunc<
   (self: ISteamUGC, nConsumerAppId: number, nPublishedFileID: number) => number
> = lib.cdecl(
   "UGCUpdateHandle_t SteamAPI_ISteamUGC_StartItemUpdate(ISteamUGC * self, AppId_t nConsumerAppId, PublishedFileId_t nPublishedFileID)"
);
export const SteamAPI_ISteamUGC_SetItemTitle: KoffiFunc<
   (self: ISteamUGC, handle: number, pchTitle: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemTitle(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchTitle)"
);
export const SteamAPI_ISteamUGC_SetItemDescription: KoffiFunc<
   (self: ISteamUGC, handle: number, pchDescription: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemDescription(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchDescription)"
);
export const SteamAPI_ISteamUGC_SetItemUpdateLanguage: KoffiFunc<
   (self: ISteamUGC, handle: number, pchLanguage: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemUpdateLanguage(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchLanguage)"
);
export const SteamAPI_ISteamUGC_SetItemMetadata: KoffiFunc<
   (self: ISteamUGC, handle: number, pchMetaData: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemMetadata(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchMetaData)"
);
export const SteamAPI_ISteamUGC_SetItemVisibility: KoffiFunc<
   (self: ISteamUGC, handle: number, eVisibility: ERemoteStoragePublishedFileVisibility) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemVisibility(ISteamUGC * self, UGCUpdateHandle_t handle, ERemoteStoragePublishedFileVisibility eVisibility)"
);
export const SteamAPI_ISteamUGC_SetItemContent: KoffiFunc<
   (self: ISteamUGC, handle: number, pszContentFolder: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemContent(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pszContentFolder)"
);
export const SteamAPI_ISteamUGC_SetItemPreview: KoffiFunc<
   (self: ISteamUGC, handle: number, pszPreviewFile: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetItemPreview(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pszPreviewFile)"
);
export const SteamAPI_ISteamUGC_SetAllowLegacyUpload: KoffiFunc<
   (self: ISteamUGC, handle: number, bAllowLegacyUpload: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_SetAllowLegacyUpload(ISteamUGC * self, UGCUpdateHandle_t handle, bool bAllowLegacyUpload)"
);
export const SteamAPI_ISteamUGC_RemoveAllItemKeyValueTags: KoffiFunc<(self: ISteamUGC, handle: number) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamUGC_RemoveAllItemKeyValueTags(ISteamUGC * self, UGCUpdateHandle_t handle)");
export const SteamAPI_ISteamUGC_RemoveItemKeyValueTags: KoffiFunc<
   (self: ISteamUGC, handle: number, pchKey: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_RemoveItemKeyValueTags(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchKey)"
);
export const SteamAPI_ISteamUGC_AddItemKeyValueTag: KoffiFunc<
   (self: ISteamUGC, handle: number, pchKey: string, pchValue: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddItemKeyValueTag(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamUGC_AddItemPreviewFile: KoffiFunc<
   (self: ISteamUGC, handle: number, pszPreviewFile: string, type: EItemPreviewType) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddItemPreviewFile(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pszPreviewFile, EItemPreviewType type)"
);
export const SteamAPI_ISteamUGC_AddItemPreviewVideo: KoffiFunc<
   (self: ISteamUGC, handle: number, pszVideoID: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_AddItemPreviewVideo(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pszVideoID)"
);
export const SteamAPI_ISteamUGC_UpdateItemPreviewFile: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pszPreviewFile: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_UpdateItemPreviewFile(ISteamUGC * self, UGCUpdateHandle_t handle, uint32 index, const char * pszPreviewFile)"
);
export const SteamAPI_ISteamUGC_UpdateItemPreviewVideo: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number, pszVideoID: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_UpdateItemPreviewVideo(ISteamUGC * self, UGCUpdateHandle_t handle, uint32 index, const char * pszVideoID)"
);
export const SteamAPI_ISteamUGC_RemoveItemPreview: KoffiFunc<
   (self: ISteamUGC, handle: number, index: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamUGC_RemoveItemPreview(ISteamUGC * self, UGCUpdateHandle_t handle, uint32 index)");
export const SteamAPI_ISteamUGC_SubmitItemUpdate: KoffiFunc<
   (self: ISteamUGC, handle: number, pchChangeNote: string) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_SubmitItemUpdate(ISteamUGC * self, UGCUpdateHandle_t handle, const char * pchChangeNote)"
);
export const SteamAPI_ISteamUGC_GetItemUpdateProgress: KoffiFunc<
   (self: ISteamUGC, handle: number, punBytesProcessed: [number], punBytesTotal: [number]) => EItemUpdateStatus
> = lib.cdecl(
   "EItemUpdateStatus SteamAPI_ISteamUGC_GetItemUpdateProgress(ISteamUGC * self, UGCUpdateHandle_t handle, _Out_ uint64 * punBytesProcessed, _Out_ uint64 * punBytesTotal)"
);
export const SteamAPI_ISteamUGC_SetUserItemVote: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, bVoteUp: boolean) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_SetUserItemVote(ISteamUGC * self, PublishedFileId_t nPublishedFileID, bool bVoteUp)"
);
export const SteamAPI_ISteamUGC_GetUserItemVote: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUGC_GetUserItemVote(ISteamUGC * self, PublishedFileId_t nPublishedFileID)");
export const SteamAPI_ISteamUGC_AddItemToFavorites: KoffiFunc<
   (self: ISteamUGC, nAppId: number, nPublishedFileID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_AddItemToFavorites(ISteamUGC * self, AppId_t nAppId, PublishedFileId_t nPublishedFileID)"
);
export const SteamAPI_ISteamUGC_RemoveItemFromFavorites: KoffiFunc<
   (self: ISteamUGC, nAppId: number, nPublishedFileID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_RemoveItemFromFavorites(ISteamUGC * self, AppId_t nAppId, PublishedFileId_t nPublishedFileID)"
);
export const SteamAPI_ISteamUGC_SubscribeItem: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUGC_SubscribeItem(ISteamUGC * self, PublishedFileId_t nPublishedFileID)");
export const SteamAPI_ISteamUGC_UnsubscribeItem: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUGC_UnsubscribeItem(ISteamUGC * self, PublishedFileId_t nPublishedFileID)");
export const SteamAPI_ISteamUGC_GetNumSubscribedItems: KoffiFunc<(self: ISteamUGC) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamUGC_GetNumSubscribedItems(ISteamUGC * self)"
);
export const SteamAPI_ISteamUGC_GetSubscribedItems: KoffiFunc<
   (self: ISteamUGC, pvecPublishedFileID: [number], cMaxEntries: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamUGC_GetSubscribedItems(ISteamUGC * self, _Out_ PublishedFileId_t * pvecPublishedFileID, uint32 cMaxEntries)"
);
export const SteamAPI_ISteamUGC_GetItemState: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl("uint32 SteamAPI_ISteamUGC_GetItemState(ISteamUGC * self, PublishedFileId_t nPublishedFileID)");
export const SteamAPI_ISteamUGC_GetItemInstallInfo: KoffiFunc<
   (
      self: ISteamUGC,
      nPublishedFileID: number,
      punSizeOnDisk: [number],
      pchFolder: [string],
      cchFolderSize: number,
      punTimeStamp: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetItemInstallInfo(ISteamUGC * self, PublishedFileId_t nPublishedFileID, _Out_ uint64 * punSizeOnDisk, _Out_ char * pchFolder, uint32 cchFolderSize, _Out_ uint32 * punTimeStamp)"
);
export const SteamAPI_ISteamUGC_GetItemDownloadInfo: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, punBytesDownloaded: [number], punBytesTotal: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_GetItemDownloadInfo(ISteamUGC * self, PublishedFileId_t nPublishedFileID, _Out_ uint64 * punBytesDownloaded, _Out_ uint64 * punBytesTotal)"
);
export const SteamAPI_ISteamUGC_DownloadItem: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, bHighPriority: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_DownloadItem(ISteamUGC * self, PublishedFileId_t nPublishedFileID, bool bHighPriority)"
);
export const SteamAPI_ISteamUGC_BInitWorkshopForGameServer: KoffiFunc<
   (self: ISteamUGC, unWorkshopDepotID: number, pszFolder: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_BInitWorkshopForGameServer(ISteamUGC * self, DepotId_t unWorkshopDepotID, const char * pszFolder)"
);
export const SteamAPI_ISteamUGC_SuspendDownloads: KoffiFunc<(self: ISteamUGC, bSuspend: boolean) => void> = lib.cdecl(
   "void SteamAPI_ISteamUGC_SuspendDownloads(ISteamUGC * self, bool bSuspend)"
);
export const SteamAPI_ISteamUGC_StartPlaytimeTracking: KoffiFunc<
   (self: ISteamUGC, pvecPublishedFileID: [number], unNumPublishedFileIDs: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_StartPlaytimeTracking(ISteamUGC * self, _Out_ PublishedFileId_t * pvecPublishedFileID, uint32 unNumPublishedFileIDs)"
);
export const SteamAPI_ISteamUGC_StopPlaytimeTracking: KoffiFunc<
   (self: ISteamUGC, pvecPublishedFileID: [number], unNumPublishedFileIDs: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_StopPlaytimeTracking(ISteamUGC * self, _Out_ PublishedFileId_t * pvecPublishedFileID, uint32 unNumPublishedFileIDs)"
);
export const SteamAPI_ISteamUGC_StopPlaytimeTrackingForAllItems: KoffiFunc<(self: ISteamUGC) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_StopPlaytimeTrackingForAllItems(ISteamUGC * self)"
);
export const SteamAPI_ISteamUGC_AddDependency: KoffiFunc<
   (self: ISteamUGC, nParentPublishedFileID: number, nChildPublishedFileID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_AddDependency(ISteamUGC * self, PublishedFileId_t nParentPublishedFileID, PublishedFileId_t nChildPublishedFileID)"
);
export const SteamAPI_ISteamUGC_RemoveDependency: KoffiFunc<
   (self: ISteamUGC, nParentPublishedFileID: number, nChildPublishedFileID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_RemoveDependency(ISteamUGC * self, PublishedFileId_t nParentPublishedFileID, PublishedFileId_t nChildPublishedFileID)"
);
export const SteamAPI_ISteamUGC_AddAppDependency: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, nAppID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_AddAppDependency(ISteamUGC * self, PublishedFileId_t nPublishedFileID, AppId_t nAppID)"
);
export const SteamAPI_ISteamUGC_RemoveAppDependency: KoffiFunc<
   (self: ISteamUGC, nPublishedFileID: number, nAppID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_RemoveAppDependency(ISteamUGC * self, PublishedFileId_t nPublishedFileID, AppId_t nAppID)"
);
export const SteamAPI_ISteamUGC_GetAppDependencies: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl(
      "SteamAPICall_t SteamAPI_ISteamUGC_GetAppDependencies(ISteamUGC * self, PublishedFileId_t nPublishedFileID)"
   );
export const SteamAPI_ISteamUGC_DeleteItem: KoffiFunc<(self: ISteamUGC, nPublishedFileID: number) => number> =
   lib.cdecl("SteamAPICall_t SteamAPI_ISteamUGC_DeleteItem(ISteamUGC * self, PublishedFileId_t nPublishedFileID)");
export const SteamAPI_ISteamUGC_ShowWorkshopEULA: KoffiFunc<(self: ISteamUGC) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamUGC_ShowWorkshopEULA(ISteamUGC * self)"
);
export const SteamAPI_ISteamUGC_GetWorkshopEULAStatus: KoffiFunc<(self: ISteamUGC) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamUGC_GetWorkshopEULAStatus(ISteamUGC * self)"
);
export interface ISteamAppList {
   __brand: "ISteamAppList";
}
koffi.opaque("ISteamAppList");
export const SteamAPI_SteamAppList_v001: KoffiFunc<() => ISteamAppList> = lib.cdecl(
   "ISteamAppList* SteamAPI_SteamAppList_v001()"
);
let ISteamAppList_Instance: ISteamAppList | null = null;
export function SteamAPI_ISteamAppList(): ISteamAppList {
   if (!ISteamAppList_Instance) {
      ISteamAppList_Instance = SteamAPI_SteamAppList_v001();
   }
   return ISteamAppList_Instance;
}
export const SteamAPI_ISteamAppList_GetNumInstalledApps: KoffiFunc<(self: ISteamAppList) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamAppList_GetNumInstalledApps(ISteamAppList * self)"
);
export const SteamAPI_ISteamAppList_GetInstalledApps: KoffiFunc<
   (self: ISteamAppList, pvecAppID: [number], unMaxAppIDs: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamAppList_GetInstalledApps(ISteamAppList * self, _Out_ AppId_t * pvecAppID, uint32 unMaxAppIDs)"
);
export const SteamAPI_ISteamAppList_GetAppName: KoffiFunc<
   (self: ISteamAppList, nAppID: number, pchName: [string], cchNameMax: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamAppList_GetAppName(ISteamAppList * self, AppId_t nAppID, _Out_ char * pchName, int cchNameMax)"
);
export const SteamAPI_ISteamAppList_GetAppInstallDir: KoffiFunc<
   (self: ISteamAppList, nAppID: number, pchDirectory: [string], cchNameMax: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamAppList_GetAppInstallDir(ISteamAppList * self, AppId_t nAppID, _Out_ char * pchDirectory, int cchNameMax)"
);
export const SteamAPI_ISteamAppList_GetAppBuildId: KoffiFunc<(self: ISteamAppList, nAppID: number) => number> =
   lib.cdecl("int SteamAPI_ISteamAppList_GetAppBuildId(ISteamAppList * self, AppId_t nAppID)");
export interface ISteamHTMLSurface {
   __brand: "ISteamHTMLSurface";
}
koffi.opaque("ISteamHTMLSurface");
export const SteamAPI_SteamHTMLSurface_v005: KoffiFunc<() => ISteamHTMLSurface> = lib.cdecl(
   "ISteamHTMLSurface* SteamAPI_SteamHTMLSurface_v005()"
);
let ISteamHTMLSurface_Instance: ISteamHTMLSurface | null = null;
export function SteamAPI_ISteamHTMLSurface(): ISteamHTMLSurface {
   if (!ISteamHTMLSurface_Instance) {
      ISteamHTMLSurface_Instance = SteamAPI_SteamHTMLSurface_v005();
   }
   return ISteamHTMLSurface_Instance;
}
export const SteamAPI_ISteamHTMLSurface_Init: KoffiFunc<(self: ISteamHTMLSurface) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamHTMLSurface_Init(ISteamHTMLSurface * self)"
);
export const SteamAPI_ISteamHTMLSurface_Shutdown: KoffiFunc<(self: ISteamHTMLSurface) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamHTMLSurface_Shutdown(ISteamHTMLSurface * self)"
);
export const SteamAPI_ISteamHTMLSurface_CreateBrowser: KoffiFunc<
   (self: ISteamHTMLSurface, pchUserAgent: string, pchUserCSS: string) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamHTMLSurface_CreateBrowser(ISteamHTMLSurface * self, const char * pchUserAgent, const char * pchUserCSS)"
);
export const SteamAPI_ISteamHTMLSurface_RemoveBrowser: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamHTMLSurface_RemoveBrowser(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_LoadURL: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, pchURL: string, pchPostData: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_LoadURL(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, const char * pchURL, const char * pchPostData)"
);
export const SteamAPI_ISteamHTMLSurface_SetSize: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, unWidth: number, unHeight: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetSize(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, uint32 unWidth, uint32 unHeight)"
);
export const SteamAPI_ISteamHTMLSurface_StopLoad: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamHTMLSurface_StopLoad(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_Reload: KoffiFunc<(self: ISteamHTMLSurface, unBrowserHandle: number) => void> =
   lib.cdecl("void SteamAPI_ISteamHTMLSurface_Reload(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_GoBack: KoffiFunc<(self: ISteamHTMLSurface, unBrowserHandle: number) => void> =
   lib.cdecl("void SteamAPI_ISteamHTMLSurface_GoBack(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_GoForward: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamHTMLSurface_GoForward(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_AddHeader: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, pchKey: string, pchValue: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_AddHeader(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, const char * pchKey, const char * pchValue)"
);
export const SteamAPI_ISteamHTMLSurface_ExecuteJavascript: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, pchScript: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_ExecuteJavascript(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, const char * pchScript)"
);
export const SteamAPI_ISteamHTMLSurface_MouseMove: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, x: number, y: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_MouseMove(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, int x, int y)"
);
export const SteamAPI_ISteamHTMLSurface_MouseWheel: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, nDelta: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_MouseWheel(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, int32 nDelta)"
);
export const SteamAPI_ISteamHTMLSurface_SetHorizontalScroll: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, nAbsolutePixelScroll: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetHorizontalScroll(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, uint32 nAbsolutePixelScroll)"
);
export const SteamAPI_ISteamHTMLSurface_SetVerticalScroll: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, nAbsolutePixelScroll: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetVerticalScroll(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, uint32 nAbsolutePixelScroll)"
);
export const SteamAPI_ISteamHTMLSurface_SetKeyFocus: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, bHasKeyFocus: boolean) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetKeyFocus(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, bool bHasKeyFocus)"
);
export const SteamAPI_ISteamHTMLSurface_ViewSource: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamHTMLSurface_ViewSource(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_CopyToClipboard: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_CopyToClipboard(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)"
);
export const SteamAPI_ISteamHTMLSurface_PasteFromClipboard: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_PasteFromClipboard(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)"
);
export const SteamAPI_ISteamHTMLSurface_Find: KoffiFunc<
   (
      self: ISteamHTMLSurface,
      unBrowserHandle: number,
      pchSearchStr: string,
      bCurrentlyInFind: boolean,
      bReverse: boolean
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_Find(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, const char * pchSearchStr, bool bCurrentlyInFind, bool bReverse)"
);
export const SteamAPI_ISteamHTMLSurface_StopFind: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl("void SteamAPI_ISteamHTMLSurface_StopFind(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)");
export const SteamAPI_ISteamHTMLSurface_GetLinkAtPosition: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, x: number, y: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_GetLinkAtPosition(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, int x, int y)"
);
export const SteamAPI_ISteamHTMLSurface_SetCookie: KoffiFunc<
   (
      self: ISteamHTMLSurface,
      pchHostname: string,
      pchKey: string,
      pchValue: string,
      pchPath: string,
      nExpires: number,
      bSecure: boolean,
      bHTTPOnly: boolean
   ) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetCookie(ISteamHTMLSurface * self, const char * pchHostname, const char * pchKey, const char * pchValue, const char * pchPath, RTime32 nExpires, bool bSecure, bool bHTTPOnly)"
);
export const SteamAPI_ISteamHTMLSurface_SetPageScaleFactor: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, flZoom: number, nPointX: number, nPointY: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetPageScaleFactor(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, float flZoom, int nPointX, int nPointY)"
);
export const SteamAPI_ISteamHTMLSurface_SetBackgroundMode: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, bBackgroundMode: boolean) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetBackgroundMode(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, bool bBackgroundMode)"
);
export const SteamAPI_ISteamHTMLSurface_SetDPIScalingFactor: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, flDPIScaling: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_SetDPIScalingFactor(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, float flDPIScaling)"
);
export const SteamAPI_ISteamHTMLSurface_OpenDeveloperTools: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_OpenDeveloperTools(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle)"
);
export const SteamAPI_ISteamHTMLSurface_AllowStartRequest: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, bAllowed: boolean) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_AllowStartRequest(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, bool bAllowed)"
);
export const SteamAPI_ISteamHTMLSurface_JSDialogResponse: KoffiFunc<
   (self: ISteamHTMLSurface, unBrowserHandle: number, bResult: boolean) => void
> = lib.cdecl(
   "void SteamAPI_ISteamHTMLSurface_JSDialogResponse(ISteamHTMLSurface * self, HHTMLBrowser unBrowserHandle, bool bResult)"
);
export interface ISteamInventory {
   __brand: "ISteamInventory";
}
koffi.opaque("ISteamInventory");
export const SteamAPI_SteamInventory_v003: KoffiFunc<() => ISteamInventory> = lib.cdecl(
   "ISteamInventory* SteamAPI_SteamInventory_v003()"
);
let ISteamInventory_Instance: ISteamInventory | null = null;
export function SteamAPI_ISteamInventory(): ISteamInventory {
   if (!ISteamInventory_Instance) {
      ISteamInventory_Instance = SteamAPI_SteamInventory_v003();
   }
   return ISteamInventory_Instance;
}
export const SteamAPI_ISteamInventory_GetResultStatus: KoffiFunc<
   (self: ISteamInventory, resultHandle: number) => EResult
> = lib.cdecl(
   "EResult SteamAPI_ISteamInventory_GetResultStatus(ISteamInventory * self, SteamInventoryResult_t resultHandle)"
);
export const SteamAPI_ISteamInventory_GetResultItemProperty: KoffiFunc<
   (
      self: ISteamInventory,
      resultHandle: number,
      unItemIndex: number,
      pchPropertyName: string,
      pchValueBuffer: [string],
      punValueBufferSizeOut: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetResultItemProperty(ISteamInventory * self, SteamInventoryResult_t resultHandle, uint32 unItemIndex, const char * pchPropertyName, _Out_ char * pchValueBuffer, _Out_ uint32 * punValueBufferSizeOut)"
);
export const SteamAPI_ISteamInventory_GetResultTimestamp: KoffiFunc<
   (self: ISteamInventory, resultHandle: number) => number
> = lib.cdecl(
   "uint32 SteamAPI_ISteamInventory_GetResultTimestamp(ISteamInventory * self, SteamInventoryResult_t resultHandle)"
);
export const SteamAPI_ISteamInventory_CheckResultSteamID: KoffiFunc<
   (self: ISteamInventory, resultHandle: number, steamIDExpected: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_CheckResultSteamID(ISteamInventory * self, SteamInventoryResult_t resultHandle, uint64_steamid steamIDExpected)"
);
export const SteamAPI_ISteamInventory_DestroyResult: KoffiFunc<(self: ISteamInventory, resultHandle: number) => void> =
   lib.cdecl(
      "void SteamAPI_ISteamInventory_DestroyResult(ISteamInventory * self, SteamInventoryResult_t resultHandle)"
   );
export const SteamAPI_ISteamInventory_GetAllItems: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetAllItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle)"
);
export const SteamAPI_ISteamInventory_GetItemsByID: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], pInstanceIDs: number, unCountInstanceIDs: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetItemsByID(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, const SteamItemInstanceID_t * pInstanceIDs, uint32 unCountInstanceIDs)"
);
export const SteamAPI_ISteamInventory_SerializeResult: KoffiFunc<
   (self: ISteamInventory, resultHandle: number, pOutBuffer: Buffer, punOutBufferSize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SerializeResult(ISteamInventory * self, SteamInventoryResult_t resultHandle, _Out_ void * pOutBuffer, _Out_ uint32 * punOutBufferSize)"
);
export const SteamAPI_ISteamInventory_DeserializeResult: KoffiFunc<
   (
      self: ISteamInventory,
      pOutResultHandle: [number],
      pBuffer: Buffer,
      unBufferSize: number,
      bRESERVED_MUST_BE_FALSE: boolean
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_DeserializeResult(ISteamInventory * self, _Out_ SteamInventoryResult_t * pOutResultHandle, const void * pBuffer, uint32 unBufferSize, bool bRESERVED_MUST_BE_FALSE)"
);
export const SteamAPI_ISteamInventory_GenerateItems: KoffiFunc<
   (
      self: ISteamInventory,
      pResultHandle: [number],
      pArrayItemDefs: number,
      punArrayQuantity: number,
      unArrayLength: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GenerateItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, const SteamItemDef_t * pArrayItemDefs, const uint32 * punArrayQuantity, uint32 unArrayLength)"
);
export const SteamAPI_ISteamInventory_GrantPromoItems: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GrantPromoItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle)"
);
export const SteamAPI_ISteamInventory_AddPromoItem: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], itemDef: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_AddPromoItem(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, SteamItemDef_t itemDef)"
);
export const SteamAPI_ISteamInventory_AddPromoItems: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], pArrayItemDefs: number, unArrayLength: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_AddPromoItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, const SteamItemDef_t * pArrayItemDefs, uint32 unArrayLength)"
);
export const SteamAPI_ISteamInventory_ConsumeItem: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], itemConsume: number, unQuantity: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_ConsumeItem(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, SteamItemInstanceID_t itemConsume, uint32 unQuantity)"
);
export const SteamAPI_ISteamInventory_ExchangeItems: KoffiFunc<
   (
      self: ISteamInventory,
      pResultHandle: [number],
      pArrayGenerate: number,
      punArrayGenerateQuantity: number,
      unArrayGenerateLength: number,
      pArrayDestroy: number,
      punArrayDestroyQuantity: number,
      unArrayDestroyLength: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_ExchangeItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, const SteamItemDef_t * pArrayGenerate, const uint32 * punArrayGenerateQuantity, uint32 unArrayGenerateLength, const SteamItemInstanceID_t * pArrayDestroy, const uint32 * punArrayDestroyQuantity, uint32 unArrayDestroyLength)"
);
export const SteamAPI_ISteamInventory_TransferItemQuantity: KoffiFunc<
   (
      self: ISteamInventory,
      pResultHandle: [number],
      itemIdSource: number,
      unQuantity: number,
      itemIdDest: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_TransferItemQuantity(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, SteamItemInstanceID_t itemIdSource, uint32 unQuantity, SteamItemInstanceID_t itemIdDest)"
);
export const SteamAPI_ISteamInventory_SendItemDropHeartbeat: KoffiFunc<(self: ISteamInventory) => void> = lib.cdecl(
   "void SteamAPI_ISteamInventory_SendItemDropHeartbeat(ISteamInventory * self)"
);
export const SteamAPI_ISteamInventory_TriggerItemDrop: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], dropListDefinition: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_TriggerItemDrop(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, SteamItemDef_t dropListDefinition)"
);
export const SteamAPI_ISteamInventory_TradeItems: KoffiFunc<
   (
      self: ISteamInventory,
      pResultHandle: [number],
      steamIDTradePartner: number,
      pArrayGive: number,
      pArrayGiveQuantity: number,
      nArrayGiveLength: number,
      pArrayGet: number,
      pArrayGetQuantity: number,
      nArrayGetLength: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_TradeItems(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, uint64_steamid steamIDTradePartner, const SteamItemInstanceID_t * pArrayGive, const uint32 * pArrayGiveQuantity, uint32 nArrayGiveLength, const SteamItemInstanceID_t * pArrayGet, const uint32 * pArrayGetQuantity, uint32 nArrayGetLength)"
);
export const SteamAPI_ISteamInventory_LoadItemDefinitions: KoffiFunc<(self: ISteamInventory) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_LoadItemDefinitions(ISteamInventory * self)"
);
export const SteamAPI_ISteamInventory_GetItemDefinitionIDs: KoffiFunc<
   (self: ISteamInventory, pItemDefIDs: [number], punItemDefIDsArraySize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetItemDefinitionIDs(ISteamInventory * self, _Out_ SteamItemDef_t * pItemDefIDs, _Out_ uint32 * punItemDefIDsArraySize)"
);
export const SteamAPI_ISteamInventory_GetItemDefinitionProperty: KoffiFunc<
   (
      self: ISteamInventory,
      iDefinition: number,
      pchPropertyName: string,
      pchValueBuffer: [string],
      punValueBufferSizeOut: [number]
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetItemDefinitionProperty(ISteamInventory * self, SteamItemDef_t iDefinition, const char * pchPropertyName, _Out_ char * pchValueBuffer, _Out_ uint32 * punValueBufferSizeOut)"
);
export const SteamAPI_ISteamInventory_RequestEligiblePromoItemDefinitionsIDs: KoffiFunc<
   (self: ISteamInventory, steamID: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamInventory_RequestEligiblePromoItemDefinitionsIDs(ISteamInventory * self, uint64_steamid steamID)"
);
export const SteamAPI_ISteamInventory_GetEligiblePromoItemDefinitionIDs: KoffiFunc<
   (self: ISteamInventory, steamID: number, pItemDefIDs: [number], punItemDefIDsArraySize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetEligiblePromoItemDefinitionIDs(ISteamInventory * self, uint64_steamid steamID, _Out_ SteamItemDef_t * pItemDefIDs, _Out_ uint32 * punItemDefIDsArraySize)"
);
export const SteamAPI_ISteamInventory_StartPurchase: KoffiFunc<
   (self: ISteamInventory, pArrayItemDefs: number, punArrayQuantity: number, unArrayLength: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamInventory_StartPurchase(ISteamInventory * self, const SteamItemDef_t * pArrayItemDefs, const uint32 * punArrayQuantity, uint32 unArrayLength)"
);
export const SteamAPI_ISteamInventory_RequestPrices: KoffiFunc<(self: ISteamInventory) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamInventory_RequestPrices(ISteamInventory * self)"
);
export const SteamAPI_ISteamInventory_GetNumItemsWithPrices: KoffiFunc<(self: ISteamInventory) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamInventory_GetNumItemsWithPrices(ISteamInventory * self)"
);
export const SteamAPI_ISteamInventory_GetItemsWithPrices: KoffiFunc<
   (
      self: ISteamInventory,
      pArrayItemDefs: [number],
      pCurrentPrices: [number],
      pBasePrices: [number],
      unArrayLength: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetItemsWithPrices(ISteamInventory * self, _Out_ SteamItemDef_t * pArrayItemDefs, _Out_ uint64 * pCurrentPrices, _Out_ uint64 * pBasePrices, uint32 unArrayLength)"
);
export const SteamAPI_ISteamInventory_GetItemPrice: KoffiFunc<
   (self: ISteamInventory, iDefinition: number, pCurrentPrice: [number], pBasePrice: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_GetItemPrice(ISteamInventory * self, SteamItemDef_t iDefinition, _Out_ uint64 * pCurrentPrice, _Out_ uint64 * pBasePrice)"
);
export const SteamAPI_ISteamInventory_StartUpdateProperties: KoffiFunc<(self: ISteamInventory) => number> = lib.cdecl(
   "SteamInventoryUpdateHandle_t SteamAPI_ISteamInventory_StartUpdateProperties(ISteamInventory * self)"
);
export const SteamAPI_ISteamInventory_RemoveProperty: KoffiFunc<
   (self: ISteamInventory, handle: number, nItemID: number, pchPropertyName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_RemoveProperty(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, SteamItemInstanceID_t nItemID, const char * pchPropertyName)"
);
export const SteamAPI_ISteamInventory_SetPropertyString: KoffiFunc<
   (
      self: ISteamInventory,
      handle: number,
      nItemID: number,
      pchPropertyName: string,
      pchPropertyValue: string
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SetPropertyString(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, SteamItemInstanceID_t nItemID, const char * pchPropertyName, const char * pchPropertyValue)"
);
export const SteamAPI_ISteamInventory_SetPropertyBool: KoffiFunc<
   (self: ISteamInventory, handle: number, nItemID: number, pchPropertyName: string, bValue: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SetPropertyBool(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, SteamItemInstanceID_t nItemID, const char * pchPropertyName, bool bValue)"
);
export const SteamAPI_ISteamInventory_SetPropertyInt64: KoffiFunc<
   (self: ISteamInventory, handle: number, nItemID: number, pchPropertyName: string, nValue: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SetPropertyInt64(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, SteamItemInstanceID_t nItemID, const char * pchPropertyName, int64 nValue)"
);
export const SteamAPI_ISteamInventory_SetPropertyFloat: KoffiFunc<
   (self: ISteamInventory, handle: number, nItemID: number, pchPropertyName: string, flValue: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SetPropertyFloat(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, SteamItemInstanceID_t nItemID, const char * pchPropertyName, float flValue)"
);
export const SteamAPI_ISteamInventory_SubmitUpdateProperties: KoffiFunc<
   (self: ISteamInventory, handle: number, pResultHandle: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_SubmitUpdateProperties(ISteamInventory * self, SteamInventoryUpdateHandle_t handle, _Out_ SteamInventoryResult_t * pResultHandle)"
);
export const SteamAPI_ISteamInventory_InspectItem: KoffiFunc<
   (self: ISteamInventory, pResultHandle: [number], pchItemToken: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamInventory_InspectItem(ISteamInventory * self, _Out_ SteamInventoryResult_t * pResultHandle, const char * pchItemToken)"
);
export interface ISteamVideo {
   __brand: "ISteamVideo";
}
koffi.opaque("ISteamVideo");
export const SteamAPI_SteamVideo_v002: KoffiFunc<() => ISteamVideo> = lib.cdecl(
   "ISteamVideo* SteamAPI_SteamVideo_v002()"
);
let ISteamVideo_Instance: ISteamVideo | null = null;
export function SteamAPI_ISteamVideo(): ISteamVideo {
   if (!ISteamVideo_Instance) {
      ISteamVideo_Instance = SteamAPI_SteamVideo_v002();
   }
   return ISteamVideo_Instance;
}
export const SteamAPI_ISteamVideo_GetVideoURL: KoffiFunc<(self: ISteamVideo, unVideoAppID: number) => void> = lib.cdecl(
   "void SteamAPI_ISteamVideo_GetVideoURL(ISteamVideo * self, AppId_t unVideoAppID)"
);
export const SteamAPI_ISteamVideo_IsBroadcasting: KoffiFunc<(self: ISteamVideo, pnNumViewers: [number]) => boolean> =
   lib.cdecl("bool SteamAPI_ISteamVideo_IsBroadcasting(ISteamVideo * self, _Out_ int * pnNumViewers)");
export const SteamAPI_ISteamVideo_GetOPFSettings: KoffiFunc<(self: ISteamVideo, unVideoAppID: number) => void> =
   lib.cdecl("void SteamAPI_ISteamVideo_GetOPFSettings(ISteamVideo * self, AppId_t unVideoAppID)");
export const SteamAPI_ISteamVideo_GetOPFStringForApp: KoffiFunc<
   (self: ISteamVideo, unVideoAppID: number, pchBuffer: [string], pnBufferSize: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamVideo_GetOPFStringForApp(ISteamVideo * self, AppId_t unVideoAppID, _Out_ char * pchBuffer, _Out_ int32 * pnBufferSize)"
);
export interface ISteamParentalSettings {
   __brand: "ISteamParentalSettings";
}
koffi.opaque("ISteamParentalSettings");
export const SteamAPI_SteamParentalSettings_v001: KoffiFunc<() => ISteamParentalSettings> = lib.cdecl(
   "ISteamParentalSettings* SteamAPI_SteamParentalSettings_v001()"
);
let ISteamParentalSettings_Instance: ISteamParentalSettings | null = null;
export function SteamAPI_ISteamParentalSettings(): ISteamParentalSettings {
   if (!ISteamParentalSettings_Instance) {
      ISteamParentalSettings_Instance = SteamAPI_SteamParentalSettings_v001();
   }
   return ISteamParentalSettings_Instance;
}
export const SteamAPI_ISteamParentalSettings_BIsParentalLockEnabled: KoffiFunc<
   (self: ISteamParentalSettings) => boolean
> = lib.cdecl("bool SteamAPI_ISteamParentalSettings_BIsParentalLockEnabled(ISteamParentalSettings * self)");
export const SteamAPI_ISteamParentalSettings_BIsParentalLockLocked: KoffiFunc<
   (self: ISteamParentalSettings) => boolean
> = lib.cdecl("bool SteamAPI_ISteamParentalSettings_BIsParentalLockLocked(ISteamParentalSettings * self)");
export const SteamAPI_ISteamParentalSettings_BIsAppBlocked: KoffiFunc<
   (self: ISteamParentalSettings, nAppID: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamParentalSettings_BIsAppBlocked(ISteamParentalSettings * self, AppId_t nAppID)");
export const SteamAPI_ISteamParentalSettings_BIsAppInBlockList: KoffiFunc<
   (self: ISteamParentalSettings, nAppID: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamParentalSettings_BIsAppInBlockList(ISteamParentalSettings * self, AppId_t nAppID)");
export const SteamAPI_ISteamParentalSettings_BIsFeatureBlocked: KoffiFunc<
   (self: ISteamParentalSettings, eFeature: EParentalFeature) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamParentalSettings_BIsFeatureBlocked(ISteamParentalSettings * self, EParentalFeature eFeature)"
);
export const SteamAPI_ISteamParentalSettings_BIsFeatureInBlockList: KoffiFunc<
   (self: ISteamParentalSettings, eFeature: EParentalFeature) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamParentalSettings_BIsFeatureInBlockList(ISteamParentalSettings * self, EParentalFeature eFeature)"
);
export interface ISteamRemotePlay {
   __brand: "ISteamRemotePlay";
}
koffi.opaque("ISteamRemotePlay");
export const SteamAPI_SteamRemotePlay_v001: KoffiFunc<() => ISteamRemotePlay> = lib.cdecl(
   "ISteamRemotePlay* SteamAPI_SteamRemotePlay_v001()"
);
let ISteamRemotePlay_Instance: ISteamRemotePlay | null = null;
export function SteamAPI_ISteamRemotePlay(): ISteamRemotePlay {
   if (!ISteamRemotePlay_Instance) {
      ISteamRemotePlay_Instance = SteamAPI_SteamRemotePlay_v001();
   }
   return ISteamRemotePlay_Instance;
}
export const SteamAPI_ISteamRemotePlay_GetSessionCount: KoffiFunc<(self: ISteamRemotePlay) => number> = lib.cdecl(
   "uint32 SteamAPI_ISteamRemotePlay_GetSessionCount(ISteamRemotePlay * self)"
);
export const SteamAPI_ISteamRemotePlay_GetSessionID: KoffiFunc<
   (self: ISteamRemotePlay, iSessionIndex: number) => number
> = lib.cdecl(
   "RemotePlaySessionID_t SteamAPI_ISteamRemotePlay_GetSessionID(ISteamRemotePlay * self, int iSessionIndex)"
);
export const SteamAPI_ISteamRemotePlay_GetSessionSteamID: KoffiFunc<
   (self: ISteamRemotePlay, unSessionID: number) => number
> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamRemotePlay_GetSessionSteamID(ISteamRemotePlay * self, RemotePlaySessionID_t unSessionID)"
);
export const SteamAPI_ISteamRemotePlay_GetSessionClientName: KoffiFunc<
   (self: ISteamRemotePlay, unSessionID: number) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamRemotePlay_GetSessionClientName(ISteamRemotePlay * self, RemotePlaySessionID_t unSessionID)"
);
export const SteamAPI_ISteamRemotePlay_GetSessionClientFormFactor: KoffiFunc<
   (self: ISteamRemotePlay, unSessionID: number) => ESteamDeviceFormFactor
> = lib.cdecl(
   "ESteamDeviceFormFactor SteamAPI_ISteamRemotePlay_GetSessionClientFormFactor(ISteamRemotePlay * self, RemotePlaySessionID_t unSessionID)"
);
export const SteamAPI_ISteamRemotePlay_BGetSessionClientResolution: KoffiFunc<
   (self: ISteamRemotePlay, unSessionID: number, pnResolutionX: [number], pnResolutionY: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemotePlay_BGetSessionClientResolution(ISteamRemotePlay * self, RemotePlaySessionID_t unSessionID, _Out_ int * pnResolutionX, _Out_ int * pnResolutionY)"
);
export const SteamAPI_ISteamRemotePlay_BSendRemotePlayTogetherInvite: KoffiFunc<
   (self: ISteamRemotePlay, steamIDFriend: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamRemotePlay_BSendRemotePlayTogetherInvite(ISteamRemotePlay * self, uint64_steamid steamIDFriend)"
);
export interface ISteamNetworkingMessages {
   __brand: "ISteamNetworkingMessages";
}
koffi.opaque("ISteamNetworkingMessages");
export const SteamAPI_SteamNetworkingMessages_SteamAPI_v002: KoffiFunc<() => ISteamNetworkingMessages> = lib.cdecl(
   "ISteamNetworkingMessages* SteamAPI_SteamNetworkingMessages_SteamAPI_v002()"
);
let ISteamNetworkingMessages_Instance: ISteamNetworkingMessages | null = null;
export function SteamAPI_ISteamNetworkingMessages(): ISteamNetworkingMessages {
   if (!ISteamNetworkingMessages_Instance) {
      ISteamNetworkingMessages_Instance = SteamAPI_SteamNetworkingMessages_SteamAPI_v002();
   }
   return ISteamNetworkingMessages_Instance;
}
export interface ISteamNetworkingSockets {
   __brand: "ISteamNetworkingSockets";
}
koffi.opaque("ISteamNetworkingSockets");
export const SteamAPI_SteamNetworkingSockets_SteamAPI_v012: KoffiFunc<() => ISteamNetworkingSockets> = lib.cdecl(
   "ISteamNetworkingSockets* SteamAPI_SteamNetworkingSockets_SteamAPI_v012()"
);
let ISteamNetworkingSockets_Instance: ISteamNetworkingSockets | null = null;
export function SteamAPI_ISteamNetworkingSockets(): ISteamNetworkingSockets {
   if (!ISteamNetworkingSockets_Instance) {
      ISteamNetworkingSockets_Instance = SteamAPI_SteamNetworkingSockets_SteamAPI_v012();
   }
   return ISteamNetworkingSockets_Instance;
}
export const SteamAPI_ISteamNetworkingSockets_AcceptConnection: KoffiFunc<
   (self: ISteamNetworkingSockets, hConn: number) => EResult
> = lib.cdecl(
   "EResult SteamAPI_ISteamNetworkingSockets_AcceptConnection(ISteamNetworkingSockets * self, HSteamNetConnection hConn)"
);
export const SteamAPI_ISteamNetworkingSockets_CloseConnection: KoffiFunc<
   (self: ISteamNetworkingSockets, hPeer: number, nReason: number, pszDebug: string, bEnableLinger: boolean) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_CloseConnection(ISteamNetworkingSockets * self, HSteamNetConnection hPeer, int nReason, const char * pszDebug, bool bEnableLinger)"
);
export const SteamAPI_ISteamNetworkingSockets_CloseListenSocket: KoffiFunc<
   (self: ISteamNetworkingSockets, hSocket: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_CloseListenSocket(ISteamNetworkingSockets * self, HSteamListenSocket hSocket)"
);
export const SteamAPI_ISteamNetworkingSockets_SetConnectionUserData: KoffiFunc<
   (self: ISteamNetworkingSockets, hPeer: number, nUserData: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_SetConnectionUserData(ISteamNetworkingSockets * self, HSteamNetConnection hPeer, int64 nUserData)"
);
export const SteamAPI_ISteamNetworkingSockets_GetConnectionUserData: KoffiFunc<
   (self: ISteamNetworkingSockets, hPeer: number) => number
> = lib.cdecl(
   "int64 SteamAPI_ISteamNetworkingSockets_GetConnectionUserData(ISteamNetworkingSockets * self, HSteamNetConnection hPeer)"
);
export const SteamAPI_ISteamNetworkingSockets_SetConnectionName: KoffiFunc<
   (self: ISteamNetworkingSockets, hPeer: number, pszName: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamNetworkingSockets_SetConnectionName(ISteamNetworkingSockets * self, HSteamNetConnection hPeer, const char * pszName)"
);
export const SteamAPI_ISteamNetworkingSockets_GetConnectionName: KoffiFunc<
   (self: ISteamNetworkingSockets, hPeer: number, pszName: [string], nMaxLen: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_GetConnectionName(ISteamNetworkingSockets * self, HSteamNetConnection hPeer, _Out_ char * pszName, int nMaxLen)"
);
export const SteamAPI_ISteamNetworkingSockets_SendMessageToConnection: KoffiFunc<
   (
      self: ISteamNetworkingSockets,
      hConn: number,
      pData: Buffer,
      cbData: number,
      nSendFlags: number,
      pOutMessageNumber: [number]
   ) => EResult
> = lib.cdecl(
   "EResult SteamAPI_ISteamNetworkingSockets_SendMessageToConnection(ISteamNetworkingSockets * self, HSteamNetConnection hConn, const void * pData, uint32 cbData, int nSendFlags, _Out_ int64 * pOutMessageNumber)"
);
export const SteamAPI_ISteamNetworkingSockets_FlushMessagesOnConnection: KoffiFunc<
   (self: ISteamNetworkingSockets, hConn: number) => EResult
> = lib.cdecl(
   "EResult SteamAPI_ISteamNetworkingSockets_FlushMessagesOnConnection(ISteamNetworkingSockets * self, HSteamNetConnection hConn)"
);
export const SteamAPI_ISteamNetworkingSockets_GetDetailedConnectionStatus: KoffiFunc<
   (self: ISteamNetworkingSockets, hConn: number, pszBuf: [string], cbBuf: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamNetworkingSockets_GetDetailedConnectionStatus(ISteamNetworkingSockets * self, HSteamNetConnection hConn, _Out_ char * pszBuf, int cbBuf)"
);
export const SteamAPI_ISteamNetworkingSockets_ConfigureConnectionLanes: KoffiFunc<
   (
      self: ISteamNetworkingSockets,
      hConn: number,
      nNumLanes: number,
      pLanePriorities: number,
      pLaneWeights: number
   ) => EResult
> = lib.cdecl(
   "EResult SteamAPI_ISteamNetworkingSockets_ConfigureConnectionLanes(ISteamNetworkingSockets * self, HSteamNetConnection hConn, int nNumLanes, const int * pLanePriorities, const uint16 * pLaneWeights)"
);
export const SteamAPI_ISteamNetworkingSockets_InitAuthentication: KoffiFunc<
   (self: ISteamNetworkingSockets) => ESteamNetworkingAvailability
> = lib.cdecl(
   "ESteamNetworkingAvailability SteamAPI_ISteamNetworkingSockets_InitAuthentication(ISteamNetworkingSockets * self)"
);
export const SteamAPI_ISteamNetworkingSockets_CreatePollGroup: KoffiFunc<(self: ISteamNetworkingSockets) => number> =
   lib.cdecl("HSteamNetPollGroup SteamAPI_ISteamNetworkingSockets_CreatePollGroup(ISteamNetworkingSockets * self)");
export const SteamAPI_ISteamNetworkingSockets_DestroyPollGroup: KoffiFunc<
   (self: ISteamNetworkingSockets, hPollGroup: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_DestroyPollGroup(ISteamNetworkingSockets * self, HSteamNetPollGroup hPollGroup)"
);
export const SteamAPI_ISteamNetworkingSockets_SetConnectionPollGroup: KoffiFunc<
   (self: ISteamNetworkingSockets, hConn: number, hPollGroup: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_SetConnectionPollGroup(ISteamNetworkingSockets * self, HSteamNetConnection hConn, HSteamNetPollGroup hPollGroup)"
);
export const SteamAPI_ISteamNetworkingSockets_GetHostedDedicatedServerPort: KoffiFunc<
   (self: ISteamNetworkingSockets) => number
> = lib.cdecl("uint16 SteamAPI_ISteamNetworkingSockets_GetHostedDedicatedServerPort(ISteamNetworkingSockets * self)");
export const SteamAPI_ISteamNetworkingSockets_GetHostedDedicatedServerPOPID: KoffiFunc<
   (self: ISteamNetworkingSockets) => number
> = lib.cdecl(
   "SteamNetworkingPOPID SteamAPI_ISteamNetworkingSockets_GetHostedDedicatedServerPOPID(ISteamNetworkingSockets * self)"
);
export const SteamAPI_ISteamNetworkingSockets_RunCallbacks: KoffiFunc<(self: ISteamNetworkingSockets) => void> =
   lib.cdecl("void SteamAPI_ISteamNetworkingSockets_RunCallbacks(ISteamNetworkingSockets * self)");
export const SteamAPI_ISteamNetworkingSockets_BeginAsyncRequestFakeIP: KoffiFunc<
   (self: ISteamNetworkingSockets, nNumPorts: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingSockets_BeginAsyncRequestFakeIP(ISteamNetworkingSockets * self, int nNumPorts)"
);
export interface ISteamNetworkingUtils {
   __brand: "ISteamNetworkingUtils";
}
koffi.opaque("ISteamNetworkingUtils");
export const SteamAPI_ISteamNetworkingUtils_InitRelayNetworkAccess: KoffiFunc<(self: ISteamNetworkingUtils) => void> =
   lib.cdecl("void SteamAPI_ISteamNetworkingUtils_InitRelayNetworkAccess(ISteamNetworkingUtils * self)");
export const SteamAPI_ISteamNetworkingUtils_CheckPingDataUpToDate: KoffiFunc<
   (self: ISteamNetworkingUtils, flMaxAgeSeconds: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_CheckPingDataUpToDate(ISteamNetworkingUtils * self, float flMaxAgeSeconds)"
);
export const SteamAPI_ISteamNetworkingUtils_GetPingToDataCenter: KoffiFunc<
   (self: ISteamNetworkingUtils, popID: number, pViaRelayPoP: [number]) => number
> = lib.cdecl(
   "int SteamAPI_ISteamNetworkingUtils_GetPingToDataCenter(ISteamNetworkingUtils * self, SteamNetworkingPOPID popID, _Out_ SteamNetworkingPOPID * pViaRelayPoP)"
);
export const SteamAPI_ISteamNetworkingUtils_GetDirectPingToPOP: KoffiFunc<
   (self: ISteamNetworkingUtils, popID: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamNetworkingUtils_GetDirectPingToPOP(ISteamNetworkingUtils * self, SteamNetworkingPOPID popID)"
);
export const SteamAPI_ISteamNetworkingUtils_GetPOPCount: KoffiFunc<(self: ISteamNetworkingUtils) => number> = lib.cdecl(
   "int SteamAPI_ISteamNetworkingUtils_GetPOPCount(ISteamNetworkingUtils * self)"
);
export const SteamAPI_ISteamNetworkingUtils_GetPOPList: KoffiFunc<
   (self: ISteamNetworkingUtils, list: [number], nListSz: number) => number
> = lib.cdecl(
   "int SteamAPI_ISteamNetworkingUtils_GetPOPList(ISteamNetworkingUtils * self, _Out_ SteamNetworkingPOPID * list, int nListSz)"
);
export const SteamAPI_ISteamNetworkingUtils_GetLocalTimestamp: KoffiFunc<(self: ISteamNetworkingUtils) => number> =
   lib.cdecl(
      "SteamNetworkingMicroseconds SteamAPI_ISteamNetworkingUtils_GetLocalTimestamp(ISteamNetworkingUtils * self)"
   );
export const SteamAPI_ISteamNetworkingUtils_IsFakeIPv4: KoffiFunc<
   (self: ISteamNetworkingUtils, nIPv4: number) => boolean
> = lib.cdecl("bool SteamAPI_ISteamNetworkingUtils_IsFakeIPv4(ISteamNetworkingUtils * self, uint32 nIPv4)");
export const SteamAPI_ISteamNetworkingUtils_GetIPv4FakeIPType: KoffiFunc<
   (self: ISteamNetworkingUtils, nIPv4: number) => ESteamNetworkingFakeIPType
> = lib.cdecl(
   "ESteamNetworkingFakeIPType SteamAPI_ISteamNetworkingUtils_GetIPv4FakeIPType(ISteamNetworkingUtils * self, uint32 nIPv4)"
);
export const SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueInt32: KoffiFunc<
   (self: ISteamNetworkingUtils, eValue: ESteamNetworkingConfigValue, val: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueInt32(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, int32 val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueFloat: KoffiFunc<
   (self: ISteamNetworkingUtils, eValue: ESteamNetworkingConfigValue, val: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueFloat(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, float val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueString: KoffiFunc<
   (self: ISteamNetworkingUtils, eValue: ESteamNetworkingConfigValue, val: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValueString(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, const char * val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValuePtr: KoffiFunc<
   (self: ISteamNetworkingUtils, eValue: ESteamNetworkingConfigValue, val: Buffer) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetGlobalConfigValuePtr(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, _Out_ void * val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueInt32: KoffiFunc<
   (self: ISteamNetworkingUtils, hConn: number, eValue: ESteamNetworkingConfigValue, val: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueInt32(ISteamNetworkingUtils * self, HSteamNetConnection hConn, ESteamNetworkingConfigValue eValue, int32 val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueFloat: KoffiFunc<
   (self: ISteamNetworkingUtils, hConn: number, eValue: ESteamNetworkingConfigValue, val: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueFloat(ISteamNetworkingUtils * self, HSteamNetConnection hConn, ESteamNetworkingConfigValue eValue, float val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueString: KoffiFunc<
   (self: ISteamNetworkingUtils, hConn: number, eValue: ESteamNetworkingConfigValue, val: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetConnectionConfigValueString(ISteamNetworkingUtils * self, HSteamNetConnection hConn, ESteamNetworkingConfigValue eValue, const char * val)"
);
export const SteamAPI_ISteamNetworkingUtils_SetConfigValue: KoffiFunc<
   (
      self: ISteamNetworkingUtils,
      eValue: ESteamNetworkingConfigValue,
      eScopeType: ESteamNetworkingConfigScope,
      scopeObj: number,
      eDataType: ESteamNetworkingConfigDataType,
      pArg: Buffer
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamNetworkingUtils_SetConfigValue(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, ESteamNetworkingConfigScope eScopeType, intptr_t scopeObj, ESteamNetworkingConfigDataType eDataType, const void * pArg)"
);
export const SteamAPI_ISteamNetworkingUtils_GetConfigValue: KoffiFunc<
   (
      self: ISteamNetworkingUtils,
      eValue: ESteamNetworkingConfigValue,
      eScopeType: ESteamNetworkingConfigScope,
      scopeObj: number,
      pOutDataType: [ESteamNetworkingConfigDataType],
      pResult: Buffer,
      cbResult: [number]
   ) => ESteamNetworkingGetConfigValueResult
> = lib.cdecl(
   "ESteamNetworkingGetConfigValueResult SteamAPI_ISteamNetworkingUtils_GetConfigValue(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, ESteamNetworkingConfigScope eScopeType, intptr_t scopeObj, _Out_ ESteamNetworkingConfigDataType * pOutDataType, _Out_ void * pResult, _Out_ size_t * cbResult)"
);
export const SteamAPI_ISteamNetworkingUtils_GetConfigValueInfo: KoffiFunc<
   (
      self: ISteamNetworkingUtils,
      eValue: ESteamNetworkingConfigValue,
      pOutDataType: [ESteamNetworkingConfigDataType],
      pOutScope: [ESteamNetworkingConfigScope]
   ) => string
> = lib.cdecl(
   "const char * SteamAPI_ISteamNetworkingUtils_GetConfigValueInfo(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eValue, _Out_ ESteamNetworkingConfigDataType * pOutDataType, _Out_ ESteamNetworkingConfigScope * pOutScope)"
);
export const SteamAPI_ISteamNetworkingUtils_IterateGenericEditableConfigValues: KoffiFunc<
   (
      self: ISteamNetworkingUtils,
      eCurrent: ESteamNetworkingConfigValue,
      bEnumerateDevVars: boolean
   ) => ESteamNetworkingConfigValue
> = lib.cdecl(
   "ESteamNetworkingConfigValue SteamAPI_ISteamNetworkingUtils_IterateGenericEditableConfigValues(ISteamNetworkingUtils * self, ESteamNetworkingConfigValue eCurrent, bool bEnumerateDevVars)"
);
export interface ISteamGameServer {
   __brand: "ISteamGameServer";
}
koffi.opaque("ISteamGameServer");
export const SteamAPI_ISteamGameServer_SetProduct: KoffiFunc<(self: ISteamGameServer, pszProduct: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetProduct(ISteamGameServer * self, const char * pszProduct)");
export const SteamAPI_ISteamGameServer_SetGameDescription: KoffiFunc<
   (self: ISteamGameServer, pszGameDescription: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_SetGameDescription(ISteamGameServer * self, const char * pszGameDescription)"
);
export const SteamAPI_ISteamGameServer_SetModDir: KoffiFunc<(self: ISteamGameServer, pszModDir: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetModDir(ISteamGameServer * self, const char * pszModDir)");
export const SteamAPI_ISteamGameServer_SetDedicatedServer: KoffiFunc<
   (self: ISteamGameServer, bDedicated: boolean) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetDedicatedServer(ISteamGameServer * self, bool bDedicated)");
export const SteamAPI_ISteamGameServer_LogOn: KoffiFunc<(self: ISteamGameServer, pszToken: string) => void> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_LogOn(ISteamGameServer * self, const char * pszToken)"
);
export const SteamAPI_ISteamGameServer_LogOnAnonymous: KoffiFunc<(self: ISteamGameServer) => void> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_LogOnAnonymous(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_LogOff: KoffiFunc<(self: ISteamGameServer) => void> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_LogOff(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_BLoggedOn: KoffiFunc<(self: ISteamGameServer) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_BLoggedOn(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_BSecure: KoffiFunc<(self: ISteamGameServer) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_BSecure(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_GetSteamID: KoffiFunc<(self: ISteamGameServer) => number> = lib.cdecl(
   "uint64_steamid SteamAPI_ISteamGameServer_GetSteamID(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_WasRestartRequested: KoffiFunc<(self: ISteamGameServer) => boolean> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_WasRestartRequested(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_SetMaxPlayerCount: KoffiFunc<
   (self: ISteamGameServer, cPlayersMax: number) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetMaxPlayerCount(ISteamGameServer * self, int cPlayersMax)");
export const SteamAPI_ISteamGameServer_SetBotPlayerCount: KoffiFunc<
   (self: ISteamGameServer, cBotplayers: number) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetBotPlayerCount(ISteamGameServer * self, int cBotplayers)");
export const SteamAPI_ISteamGameServer_SetServerName: KoffiFunc<
   (self: ISteamGameServer, pszServerName: string) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetServerName(ISteamGameServer * self, const char * pszServerName)");
export const SteamAPI_ISteamGameServer_SetMapName: KoffiFunc<(self: ISteamGameServer, pszMapName: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetMapName(ISteamGameServer * self, const char * pszMapName)");
export const SteamAPI_ISteamGameServer_SetPasswordProtected: KoffiFunc<
   (self: ISteamGameServer, bPasswordProtected: boolean) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetPasswordProtected(ISteamGameServer * self, bool bPasswordProtected)");
export const SteamAPI_ISteamGameServer_SetSpectatorPort: KoffiFunc<
   (self: ISteamGameServer, unSpectatorPort: number) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetSpectatorPort(ISteamGameServer * self, uint16 unSpectatorPort)");
export const SteamAPI_ISteamGameServer_SetSpectatorServerName: KoffiFunc<
   (self: ISteamGameServer, pszSpectatorServerName: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_SetSpectatorServerName(ISteamGameServer * self, const char * pszSpectatorServerName)"
);
export const SteamAPI_ISteamGameServer_ClearAllKeyValues: KoffiFunc<(self: ISteamGameServer) => void> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_ClearAllKeyValues(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_SetKeyValue: KoffiFunc<
   (self: ISteamGameServer, pKey: string, pValue: string) => void
> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_SetKeyValue(ISteamGameServer * self, const char * pKey, const char * pValue)"
);
export const SteamAPI_ISteamGameServer_SetGameTags: KoffiFunc<(self: ISteamGameServer, pchGameTags: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetGameTags(ISteamGameServer * self, const char * pchGameTags)");
export const SteamAPI_ISteamGameServer_SetGameData: KoffiFunc<(self: ISteamGameServer, pchGameData: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetGameData(ISteamGameServer * self, const char * pchGameData)");
export const SteamAPI_ISteamGameServer_SetRegion: KoffiFunc<(self: ISteamGameServer, pszRegion: string) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_SetRegion(ISteamGameServer * self, const char * pszRegion)");
export const SteamAPI_ISteamGameServer_SetAdvertiseServerActive: KoffiFunc<
   (self: ISteamGameServer, bActive: boolean) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_SetAdvertiseServerActive(ISteamGameServer * self, bool bActive)");
export const SteamAPI_ISteamGameServer_GetAuthSessionTicket: KoffiFunc<
   (self: ISteamGameServer, pTicket: Buffer, cbMaxTicket: number, pcbTicket: [number]) => number
> = lib.cdecl(
   "HAuthTicket SteamAPI_ISteamGameServer_GetAuthSessionTicket(ISteamGameServer * self, _Out_ void * pTicket, int cbMaxTicket, _Out_ uint32 * pcbTicket)"
);
export const SteamAPI_ISteamGameServer_BeginAuthSession: KoffiFunc<
   (self: ISteamGameServer, pAuthTicket: Buffer, cbAuthTicket: number, steamID: number) => EBeginAuthSessionResult
> = lib.cdecl(
   "EBeginAuthSessionResult SteamAPI_ISteamGameServer_BeginAuthSession(ISteamGameServer * self, const void * pAuthTicket, int cbAuthTicket, uint64_steamid steamID)"
);
export const SteamAPI_ISteamGameServer_EndAuthSession: KoffiFunc<(self: ISteamGameServer, steamID: number) => void> =
   lib.cdecl("void SteamAPI_ISteamGameServer_EndAuthSession(ISteamGameServer * self, uint64_steamid steamID)");
export const SteamAPI_ISteamGameServer_CancelAuthTicket: KoffiFunc<
   (self: ISteamGameServer, hAuthTicket: number) => void
> = lib.cdecl("void SteamAPI_ISteamGameServer_CancelAuthTicket(ISteamGameServer * self, HAuthTicket hAuthTicket)");
export const SteamAPI_ISteamGameServer_UserHasLicenseForApp: KoffiFunc<
   (self: ISteamGameServer, steamID: number, appID: number) => EUserHasLicenseForAppResult
> = lib.cdecl(
   "EUserHasLicenseForAppResult SteamAPI_ISteamGameServer_UserHasLicenseForApp(ISteamGameServer * self, uint64_steamid steamID, AppId_t appID)"
);
export const SteamAPI_ISteamGameServer_RequestUserGroupStatus: KoffiFunc<
   (self: ISteamGameServer, steamIDUser: number, steamIDGroup: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_RequestUserGroupStatus(ISteamGameServer * self, uint64_steamid steamIDUser, uint64_steamid steamIDGroup)"
);
export const SteamAPI_ISteamGameServer_GetGameplayStats: KoffiFunc<(self: ISteamGameServer) => void> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_GetGameplayStats(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_GetServerReputation: KoffiFunc<(self: ISteamGameServer) => number> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamGameServer_GetServerReputation(ISteamGameServer * self)"
);
export const SteamAPI_ISteamGameServer_HandleIncomingPacket: KoffiFunc<
   (self: ISteamGameServer, pData: Buffer, cbData: number, srcIP: number, srcPort: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_HandleIncomingPacket(ISteamGameServer * self, const void * pData, int cbData, uint32 srcIP, uint16 srcPort)"
);
export const SteamAPI_ISteamGameServer_GetNextOutgoingPacket: KoffiFunc<
   (self: ISteamGameServer, pOut: Buffer, cbMaxOut: number, pNetAdr: [number], pPort: [number]) => number
> = lib.cdecl(
   "int SteamAPI_ISteamGameServer_GetNextOutgoingPacket(ISteamGameServer * self, _Out_ void * pOut, int cbMaxOut, _Out_ uint32 * pNetAdr, _Out_ uint16 * pPort)"
);
export const SteamAPI_ISteamGameServer_AssociateWithClan: KoffiFunc<
   (self: ISteamGameServer, steamIDClan: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamGameServer_AssociateWithClan(ISteamGameServer * self, uint64_steamid steamIDClan)"
);
export const SteamAPI_ISteamGameServer_ComputeNewPlayerCompatibility: KoffiFunc<
   (self: ISteamGameServer, steamIDNewPlayer: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamGameServer_ComputeNewPlayerCompatibility(ISteamGameServer * self, uint64_steamid steamIDNewPlayer)"
);
export const SteamAPI_ISteamGameServer_CreateUnauthenticatedUserConnection: KoffiFunc<
   (self: ISteamGameServer) => number
> = lib.cdecl("uint64_steamid SteamAPI_ISteamGameServer_CreateUnauthenticatedUserConnection(ISteamGameServer * self)");
export const SteamAPI_ISteamGameServer_SendUserDisconnect_DEPRECATED: KoffiFunc<
   (self: ISteamGameServer, steamIDUser: number) => void
> = lib.cdecl(
   "void SteamAPI_ISteamGameServer_SendUserDisconnect_DEPRECATED(ISteamGameServer * self, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamGameServer_BUpdateUserData: KoffiFunc<
   (self: ISteamGameServer, steamIDUser: number, pchPlayerName: string, uScore: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServer_BUpdateUserData(ISteamGameServer * self, uint64_steamid steamIDUser, const char * pchPlayerName, uint32 uScore)"
);
export interface ISteamGameServerStats {
   __brand: "ISteamGameServerStats";
}
koffi.opaque("ISteamGameServerStats");
export const SteamAPI_ISteamGameServerStats_RequestUserStats: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamGameServerStats_RequestUserStats(ISteamGameServerStats * self, uint64_steamid steamIDUser)"
);
export const SteamAPI_ISteamGameServerStats_GetUserStatInt32: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_GetUserStatInt32(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ int32 * pData)"
);
export const SteamAPI_ISteamGameServerStats_GetUserStatFloat: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string, pData: [number]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_GetUserStatFloat(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ float * pData)"
);
export const SteamAPI_ISteamGameServerStats_GetUserAchievement: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string, pbAchieved: [boolean]) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_GetUserAchievement(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, _Out_ bool * pbAchieved)"
);
export const SteamAPI_ISteamGameServerStats_SetUserStatInt32: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string, nData: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_SetUserStatInt32(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, int32 nData)"
);
export const SteamAPI_ISteamGameServerStats_SetUserStatFloat: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string, fData: number) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_SetUserStatFloat(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, float fData)"
);
export const SteamAPI_ISteamGameServerStats_UpdateUserAvgRateStat: KoffiFunc<
   (
      self: ISteamGameServerStats,
      steamIDUser: number,
      pchName: string,
      flCountThisSession: number,
      dSessionLength: number
   ) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_UpdateUserAvgRateStat(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName, float flCountThisSession, double dSessionLength)"
);
export const SteamAPI_ISteamGameServerStats_SetUserAchievement: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_SetUserAchievement(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName)"
);
export const SteamAPI_ISteamGameServerStats_ClearUserAchievement: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number, pchName: string) => boolean
> = lib.cdecl(
   "bool SteamAPI_ISteamGameServerStats_ClearUserAchievement(ISteamGameServerStats * self, uint64_steamid steamIDUser, const char * pchName)"
);
export const SteamAPI_ISteamGameServerStats_StoreUserStats: KoffiFunc<
   (self: ISteamGameServerStats, steamIDUser: number) => number
> = lib.cdecl(
   "SteamAPICall_t SteamAPI_ISteamGameServerStats_StoreUserStats(ISteamGameServerStats * self, uint64_steamid steamIDUser)"
);
export interface ISteamNetworkingFakeUDPPort {
   __brand: "ISteamNetworkingFakeUDPPort";
}
koffi.opaque("ISteamNetworkingFakeUDPPort");
export const SteamAPI_ISteamNetworkingFakeUDPPort_DestroyFakeUDPPort: KoffiFunc<
   (self: ISteamNetworkingFakeUDPPort) => void
> = lib.cdecl("void SteamAPI_ISteamNetworkingFakeUDPPort_DestroyFakeUDPPort(ISteamNetworkingFakeUDPPort * self)");
