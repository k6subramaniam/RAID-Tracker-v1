import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, List, useTheme } from 'react-native-paper';

const GovernanceScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            RAID Definitions
          </Text>
          
          <List.Item
            title="Risk"
            description="A potential event that could negatively impact the project if it occurs"
            left={props => <List.Icon {...props} icon="alert-circle" color={theme.colors.risk} />}
          />
          
          <List.Item
            title="Assumption"
            description="Something believed to be true that affects project planning"
            left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.assumption} />}
          />
          
          <List.Item
            title="Issue"
            description="A current problem that is impacting the project"
            left={props => <List.Icon {...props} icon="alert" color={theme.colors.issue} />}
          />
          
          <List.Item
            title="Dependency"
            description="An external factor that the project relies upon"
            left={props => <List.Icon {...props} icon="link-variant" color={theme.colors.dependency} />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Priority SLAs
          </Text>
          
          <List.Item
            title="P0 - Critical"
            description="Response within 24 hours"
            left={props => <List.Icon {...props} icon="flag" color={theme.colors.p0} />}
          />
          
          <List.Item
            title="P1 - High"
            description="Response within 48 hours"
            left={props => <List.Icon {...props} icon="flag" color={theme.colors.p1} />}
          />
          
          <List.Item
            title="P2 - Medium"
            description="Response within 72 hours"
            left={props => <List.Icon {...props} icon="flag" color={theme.colors.p2} />}
          />
          
          <List.Item
            title="P3 - Low"
            description="Response within 1 week"
            left={props => <List.Icon {...props} icon="flag" color={theme.colors.p3} />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            Escalation Paths
          </Text>
          <Text variant="bodyMedium">
            For critical issues, follow the escalation matrix:
          </Text>
          <List.Item
            title="Level 1"
            description="Team Lead / Project Manager"
            left={props => <List.Icon {...props} icon="numeric-1-circle" />}
          />
          <List.Item
            title="Level 2"
            description="Department Head / Program Manager"
            left={props => <List.Icon {...props} icon="numeric-2-circle" />}
          />
          <List.Item
            title="Level 3"
            description="Executive Sponsor / C-Suite"
            left={props => <List.Icon {...props} icon="numeric-3-circle" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
  },
});

export default GovernanceScreen;