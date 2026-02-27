import {
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import classNames from 'classnames';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';

import { useCallback } from 'react';

import { numberToUsd } from '../../util';
import { useStaticData } from '../StaticDataProvider';

const MitigationCategory = ({
  name,
  mitigations,
  toggledMitigations,
  toggleMitigation,
  allocatedBudget,
  budget,
  isSummary,
  allowSell = false,
}) => {
  const { getTextWithSynonyms } = useStaticData();

  const confirmBuy = useCallback(
    (mitigation, event) => {
      const checked = event.target.checked;

      if (!allowSell) {
        if (
          checked &&
          window.confirm(
            `Are you sure you want to buy ${mitigation.description}?`,
          )
        ) {
          toggleMitigation({
            id: mitigation.id,
            value: checked,
          });
        }
      } else {
        toggleMitigation({
          id: mitigation.id,
          value: checked,
        });
      }
    },
    [toggleMitigation, allowSell],
  );

  const getTooltipMessage = useCallback(
    (mitigation) => {
      if (
        !toggledMitigations[mitigation.id] &&
        budget < mitigation.cost
      ) {
        return "Yout don't have the budget to purchase this item!";
      }

      if (toggledMitigations[mitigation.id]) {
        return 'You have alraedy purchased this item!';
      }

      return 'Click to purchase this item!';
    },
    [toggledMitigations, budget],
  );

  return (
    <div className={classNames('py-3', isSummary ? 'my-3' : 'my-5')}>
      <Row className="pb-2">
        <Col xs={11}>
          <h4 className="m-0 font-weight-normal border-bottom border-primary w-100 text-uppercase">
            ALLOCATED <span className="font-weight-bold">{name}</span>{' '}
	    {getTextWithSynonyms('budget').toUpperCase()} :{' '}
            {numberToUsd(allocatedBudget)}
          </h4>
        </Col>
        <Col xs={1}>
          <Row>
            <Col xs={12} className="text-center" title="Cost">
              Cost
            </Col>
          </Row>
        </Col>
      </Row>
      {mitigations.map((mitigation) => (
        <Row className="py-2 select-row" key={mitigation.id}>
          <Col xs={11}>{mitigation.description}</Col>
          <Col xs={1}>
            <Row>
              {!isSummary ? (
                <>
                  <Col
                    xs={6}
                    className="justify-content-center d-flex"
                  >
                    <span>{numberToUsd(mitigation.cost)}</span>
                  </Col>

                  <Col xs={6}>
                    <OverlayTrigger
                      overlay={(props) => (
                        <Tooltip {...props}>
                          {getTooltipMessage(mitigation)}
                        </Tooltip>
                      )}
                      placement="bottom"
                    >
                      <div>
                        {/* This "div" is required for the tooltips to work correctly! */}
                        <Form.Check
                          type="switch"
                          className="custom-switch-center"
                          id={mitigation.id}
                          disabled={
                            !toggledMitigations[mitigation.id] &&
                            budget < mitigation.cost
                          }
                          checked={toggledMitigations[mitigation.id]}
                          onChange={(e) => confirmBuy(mitigation, e)}
                        />
                      </div>
                    </OverlayTrigger>
                  </Col>
                </>
              ) : (
                <div className="justify-content-end d-flex col-12">
                  <div className="d-flex align-items-center">
                    {numberToUsd(mitigation.cost)}
                    {toggledMitigations[mitigation.id] ? (
                      <AiOutlineCheck
                        className="ml-2"
                        fontSize="20px"
                      />
                    ) : (
                      <AiOutlineClose
                        className="ml-2"
                        fontSize="20px"
                      />
                    )}
                  </div>
                </div>
              )}
            </Row>
          </Col>
        </Row>
      ))}
    </div>
  );
};

export default MitigationCategory;
