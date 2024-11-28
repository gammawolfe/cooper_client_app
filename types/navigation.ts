export type RootStackParamList = {
  '/(modals)/wallet/create': undefined;
  '/(modals)/wallet/[id]': { id: string };
  '/(modals)/contribution/create': undefined;
  '/(modals)/contribution/[id]': { id: string };
  '/(modals)/loan/create': undefined;
  '/(modals)/loan/[id]': { id: string };
  '/(modals)/loan-request/[id]': { id: string };
};

export type NavigateFunction = <T extends keyof RootStackParamList>(
  route: T,
  params?: RootStackParamList[T]
) => void;
