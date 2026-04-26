import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text } from 'react-native';
import PressableButton from './PressableButton';
import { useTheme } from '../context/ThemeContext';
import { createBudgetStyles } from '../styles/budgetStyles';
import { ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  balances: Record<string, number>;
  settlements: string[];
  onSettle: (
    payer: string,
    receiver: string,
    amount: number,
  ) => Promise<boolean>;
};

const BalancesModal = ({
  visible,
  onClose,
  balances,
  settlements,
  onSettle,
}: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createBudgetStyles(theme), [theme]);
  const [dismissedSettlements, setDismissedSettlements] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (!visible) {
      setDismissedSettlements([]);
    }
  }, [visible]);

  const parseSettlement = (settlement: string) => {
    const parts = settlement.split(' ');
    const payLocation = parts.findIndex(part => part === 'pays');
    const payer = parts.slice(0, payLocation).join(' ');
    const receiver = parts.slice(payLocation + 1, parts.length - 1).join(' ');
    const amount = parseFloat(parts.slice(-1)[0].replace('$', ''));

    return { payer, receiver, amount };
  };

  const getSettlementKey = (settlement: string) => {
    const { payer, receiver, amount } = parseSettlement(settlement);
    return `${payer}|${receiver}|${amount.toFixed(2)}`;
  };

  const visibleSettlements = settlements.filter(
    settlement => !dismissedSettlements.includes(getSettlementKey(settlement)),
  );

  const renderBalance = ([user, balance]: [string, number]) => {
    let color = '#444';
    let label = 'settled up';

    if (balance > 0) {
      color = '#2ecc71';
      label = `gets $${balance.toFixed(2)}`;
    }

    if (balance < 0) {
      color = '#e74c3c';
      label = `owes $${Math.abs(balance).toFixed(2)}`;
    }

    return (
      <View key={user} style={styles.balanceCard}>
        <Text style={styles.balanceName}>{user}</Text>
        <Text style={[styles.balanceLabel, { color }]}>{label}</Text>
      </View>
    );
  };

  const max = Math.max(...Object.values(balances).map(b => Math.abs(b)), 1);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalRoot}>
        <View style={styles.bottomSheet}>
          <ScrollView>
            <Text style={styles.modalTitle}>Balances</Text>

            {Object.entries(balances).map(renderBalance)}

            <Text style={[styles.modalTitle, { marginTop: 20 }]}>
              Settle Up
            </Text>

            {visibleSettlements.length === 0 && (
              <Text style={{ color: '#777' }}>Everyone is settled up 👍</Text>
            )}
            <Text style={[styles.modalTitle, { marginTop: 10 }]}>
              Balance Overview
            </Text>

            {Object.entries(balances).map(([user, balance]) => {
              const width = (Math.abs(balance) / max) * 200;

              const color =
                balance > 0 ? '#2ecc71' : balance < 0 ? '#e74c3c' : '#ccc';

              return (
                <View key={user} style={{ marginBottom: 12 }}>
                  <Text style={styles.balanceName}>{user}</Text>

                  <View style={styles.overviewTrack}>
                    <View
                      style={{
                        width,
                        height: '100%',
                        backgroundColor: color,
                      }}
                    />
                  </View>

                  <Text style={styles.overviewText}>
                    {balance === 0
                      ? 'Settled'
                      : balance > 0
                      ? `Gets $${balance.toFixed(2)}`
                      : `Owes $${Math.abs(balance).toFixed(2)}`}
                  </Text>
                </View>
              );
            })}
            {visibleSettlements.map((settlement, i) => {
              const { payer, receiver, amount } = parseSettlement(settlement);

              return (
                <View
                  key={getSettlementKey(settlement) || String(i)}
                  style={{
                    backgroundColor: '#fff',
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#eee',
                  }}
                >
                  <Text style={{ marginBottom: 6 }}>
                    {payer} pays {receiver} ${amount.toFixed(2)}
                  </Text>

                  <PressableButton
                    title="Settle Up"
                    onPress={async () => {
                      const wasSettled = await onSettle(
                        payer,
                        receiver,
                        amount,
                      );
                      if (wasSettled) {
                        setDismissedSettlements(current => [
                          ...current,
                          getSettlementKey(settlement),
                        ]);
                      }
                    }}
                  />
                </View>
              );
            })}

            <View style={{ marginTop: 20 }}>
              <PressableButton title="Close" onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default BalancesModal;
