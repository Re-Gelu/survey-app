import { Text, Button, Group, Box, ActionIcon, TextInput, Switch } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, hasLength } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconCheck, IconExclamationMark, IconSkull } from '@tabler/icons';
import { mutate } from 'swr';
import axios from 'axios';

export const PollCreationForm = () => {
  const form = useForm({
    initialValues: {
      question: '',
      choices: [{ text: '', votes: []}],
      is_multiple_answer_options: false,
      expires_at: null,
    },
    validate: {
      question: hasLength({min: 1, max: 200}),
      choices: {
        text: (value, values) => {
          // Validate if texts length >= 1 and <= 100
          if (!(value.length >= 1 && value.length <= 100)) {
            return true;
          };

          // Validate if even two texts are not equal
          return values.choices.some((choice, index) =>
            values.choices.slice(index + 1).some(otherChoice =>
              choice.text.trim().toLowerCase() === otherChoice.text.trim().toLowerCase()
            )
          );
        }
      }
    },
  });

  const handleChoiceAdding = () => {
    // Check if length of choices array is >= 1 and < 10
    if (form.values.choices.length >= 1 && form.values.choices.length < 10) {
      form.insertListItem('choices', { text: '', votes: [] })
    } else {
      notifications.show({ 
        message: 'Amount of choices must be from 1 to 10!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

   const handleChoiceRemoving = (index: number) => {
    // Check if length of choices array is > 1 and <= 10
    if (form.values.choices.length > 1 && form.values.choices.length <= 10) {
      form.removeListItem('choices', index);
    } else {
      notifications.show({ 
        message: 'Amount of choices must be from 1 to 10!', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };
  };

  const handleError = (errors: typeof form.errors) => {
    if (errors.question) {
      notifications.show({ 
        message: 'Poll question must be from 1 to 100 letters long', 
        color: 'red',
        icon: <IconExclamationMark />
      });
    };

    if (Object.keys(errors).some((key) =>
      key.startsWith('choices.') && key.endsWith('.text') && errors[key]
    )) {
      notifications.show({ 
        message: 'Look what you wrote in the choice fields fucker!', 
        color: 'red',
        icon: <IconSkull />
      });
    };
  };

  const handleSubmit = async (values: typeof form.values, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    axios.post(`/api/polls`, values)
    .then(() => {
      notifications.show({ 
        message: 'Poll successfully created', 
        color: 'green',
        icon: <IconCheck />
      });

      form.reset();

      // Refresh SWR data to show actual user polls in DashboardPollsTable
      mutate(`/api/polls?offset=0&page_size=100`);
    })
    .catch((error) => {
      notifications.show({ 
        message: error.response.data.error, 
        color: 'red',
        icon: <IconSkull />
      });
    });
  };

  const fields = form.values.choices.map((item, index) => (
    <Group key={index} mb="xs">
      <TextInput
        placeholder="Your poll choice"
        withAsterisk
        sx={{ flex: 1 }}
        {...form.getInputProps(`choices.${index}.text`)}
      />
      <ActionIcon title={`Remove choice - ${index}`} color="red" onClick={() => handleChoiceRemoving(index)}>
        <IconTrash size="1rem" />
      </ActionIcon>
    </Group>
  ));

  return (
    <Box maw={500} mx="auto" component="form" onSubmit={form.onSubmit(handleSubmit, handleError)}>
      <TextInput
        placeholder="To be or not to be?"
        label="Your question"
        withAsterisk
        mb="xl"
        {...form.getInputProps(`question`)}
      />
      {fields.length > 0 ? (
        <>
          <Text weight={500} size="sm" sx={{ flex: 1 }}>
            Choices
          </Text>
          {fields}
        </>
      ) : (
        <Text color="dimmed" align="center" my="xl">
          No one here...  :(
        </Text>
      )}

      <Group position="center" mt="md">
        <Button
          variant="outline"
          onClick={() => handleChoiceAdding()}
        >
          Add poll choice
        </Button>
      </Group>

      <Group my="md" spacing="xl">
        <DateTimePicker
          clearable
          minDate={new Date()}
          dropdownType="modal"
          label="Poll expiration datetime"
          placeholder="Leave empty so that the survey is endless"
          {...form.getInputProps(`expires_at`)}
        />
        <Switch
          label="Is poll with multiple answers option?"
          {...form.getInputProps(`is_multiple_answer_options`)}
        />
      </Group>

      <Group position="center" mt="md">
        <Button type="submit" variant="outline" radius="xl" px="xl">Confrim</Button>
      </Group>
    </Box>
  );
};