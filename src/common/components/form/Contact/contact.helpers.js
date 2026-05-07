export const EMPTY_PHONE = { ref: '', areaCode: '', number: '' };
export const EMPTY_ADDRESS = { ref: '', address: '' };
export const EMPTY_EMAIL = { ref: '', email: '' };

export const normalizeRef = (value = '') => value.trim().toLowerCase();

export const hasDuplicateRef = (fields = [], ref) => {
  const normalizedRef = normalizeRef(ref);

  if (!normalizedRef) return false;

  return fields.some((item) => normalizeRef(item.ref) === normalizedRef);
};

export const updateFieldToAdd = (setter, field, value) => {
  if ((field === 'areaCode' || field === 'number') && !/^\d*$/.test(value)) {
    return;
  }

  setter(prev => ({ ...prev, [field]: value }));
};

export const clearErrorField = (error, setError, section, field) => {
  if (!error?.[section]?.[field]) return;

  setError((prev) => {
    if (!prev?.[section]) return prev;

    const nextSection = { ...prev[section] };
    delete nextSection[field];

    const next = { ...prev };

    if (Object.keys(nextSection).length) {
      next[section] = nextSection;
    } else {
      delete next[section];
    }

    return Object.keys(next).length ? next : undefined;
  });
};
